import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useBackground } from '~/modules/elements/background-context';
import isDev from '~/modules/utils/is-dev';

import type { DiffWorkerResponse } from './diff-worker';
import { clearAllSnapshots, getAllSnapshots, saveSnapshot } from './snapshot-store';

const VIEWPORTS = ['desktop', 'tablet', 'mobile-portrait', 'mobile-landscape'] as const;
type Viewport = (typeof VIEWPORTS)[number];

const VIEWPORT_LABELS: Record<Viewport, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  'mobile-portrait': 'Mobile (portrait)',
  'mobile-landscape': 'Mobile (landscape)',
};

// Vite watches this glob itself: adding/removing a screenshot file triggers a reload of this module.
// (Re-running a test that overwrites an *existing* file doesn't change the matched file set, so that
// case is handled separately below by cache-busting the <img> src on window focus.)
const screenshotUrls = import.meta.glob<string>('/tests/visual-regression/**/*.spec.ts-snapshots/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

// e.g. "edit-song-basic-info-mobile-portrait-chromium-darwin.png" -> category "edit-song-basic-info", viewport "mobile-portrait", platform "darwin"
const FILE_NAME_RE = new RegExp(`^(.*)-(${VIEWPORTS.join('|')})-[^/]+-([a-z0-9]+)\\.png$`);

function parseFileName(modulePath: string) {
  const fileName = modulePath.split('/').pop() ?? '';
  const match = fileName.match(FILE_NAME_RE);
  if (!match) return null;
  return { category: match[1], viewport: match[2] as Viewport, platform: match[3] };
}

// Snapshots are committed for both the platform devs run locally (darwin) and the one CI runs on
// (linux), sharing the same category/viewport - keep only the ones matching this machine so CI's
// baselines don't silently shadow freshly captured local ones.
const localPlatform = navigator.platform.toLowerCase().includes('mac') ? 'darwin' : 'linux';

const categories = new Map<string, Partial<Record<Viewport, string>>>();
for (const [modulePath, url] of Object.entries(screenshotUrls)) {
  const parsed = parseFileName(modulePath);
  if (!parsed || parsed.platform !== localPlatform) continue;

  const bucket = categories.get(parsed.category) ?? {};
  bucket[parsed.viewport] = url;
  categories.set(parsed.category, bucket);
}
const sortedCategories = new Map([...categories.entries()].sort(([a], [b]) => a.localeCompare(b)));

// key ("category/viewport") -> current screenshot url, for pairing captured baselines with their latest render.
const currentUrlByKey = new Map<string, string>();
for (const [category, urls] of sortedCategories) {
  for (const viewport of VIEWPORTS) {
    const url = urls[viewport];
    if (url) currentUrlByKey.set(`${category}/${viewport}`, url);
  }
}

// Bumped whenever the tab regains focus, so screenshots re-generated with the same file name (rather
// than added/removed) get re-fetched instead of showing a browser-cached copy.
function useCacheBustToken() {
  const [token, setToken] = useState(0);

  useEffect(() => {
    const bump = () => setToken((t) => t + 1);
    window.addEventListener('focus', bump);
    return () => window.removeEventListener('focus', bump);
  }, []);

  return [token, useCallback(() => setToken((t) => t + 1), [])] as const;
}

const snapshotKey = (category: string, viewport: Viewport) => `${category}/${viewport}`;

// Loads captured baseline snapshots from IndexedDB and exposes actions to (re)capture or clear them.
function useSnapshots() {
  const [snapshots, setSnapshots] = useState<Map<string, Blob>>(new Map());
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    getAllSnapshots().then(setSnapshots);
  }, []);

  const capture = useCallback(async () => {
    setIsCapturing(true);
    try {
      for (const [category, urls] of sortedCategories) {
        for (const viewport of VIEWPORTS) {
          const url = urls[viewport];
          if (!url) continue;
          const blob = await fetch(url).then((res) => res.blob());
          await saveSnapshot(snapshotKey(category, viewport), blob);
        }
      }
      setSnapshots(await getAllSnapshots());
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const clear = useCallback(async () => {
    await clearAllSnapshots();
    setSnapshots(new Map());
  }, []);

  return { snapshots, isCapturing, capture, clear };
}

export interface Diff {
  status: 'pending' | 'equal' | 'changed' | 'error';
  mismatchedPixels?: number;
  ratio?: number;
  diffUrl?: string;
}

const cacheBust = (url: string, token: number) => `${url}${url.includes('?') ? '&' : '?'}t=${token}`;

// Diffing every screenshot is expensive and re-runs on every window focus, so results are memoised in
// module scope (surviving remounts and route changes) and addressed by the *content* of the two images
// they were computed from. A screenshot whose bytes haven't changed is served straight from here, and
// the previous result stays on screen while a genuinely changed one is recomputed in the background.
const diffCache = new Map<string, { signature: string; diff: Diff }>();

const cachedDiffs = () => new Map([...diffCache].map(([key, entry]) => [key, entry.diff]));

function cacheDiff(key: string, signature: string, diff: Diff) {
  const previous = diffCache.get(key);
  if (previous?.diff.diffUrl && previous.diff.diffUrl !== diff.diffUrl) {
    URL.revokeObjectURL(previous.diff.diffUrl);
  }
  diffCache.set(key, { signature, diff });
}

async function hashBlob(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', await blob.arrayBuffer());
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Baselines only change when re-captured, and the Blob instances are stable between renders, so their
// hashes are memoised per Blob rather than recomputed on every refresh.
const baselineHashes = new WeakMap<Blob, Promise<string>>();
function hashBaseline(blob: Blob): Promise<string> {
  const existing = baselineHashes.get(blob);
  if (existing) return existing;

  const hash = hashBlob(blob);
  baselineHashes.set(blob, hash);
  return hash;
}

// Compares every captured baseline against its current screenshot in a worker, so the (potentially
// many) diffs are computed off the main thread. Results stream in as they finish, letting the list
// show a "changed" badge without blocking on the full set.
function useDiffs(snapshots: Map<string, Blob>, cacheBustToken: number): Map<string, Diff> {
  const [diffs, setDiffs] = useState<Map<string, Diff>>(cachedDiffs);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL('./diff-worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<DiffWorkerResponse>) => {
      const message = event.data;
      const diff: Diff = message.ok
        ? {
            status: message.mismatchedPixels > 0 ? 'changed' : 'equal',
            mismatchedPixels: message.mismatchedPixels,
            ratio: message.ratio,
            diffUrl: URL.createObjectURL(message.diff),
          }
        : { status: 'error' };

      cacheDiff(message.key, message.signature, diff);
      setDiffs((prev) => new Map(prev).set(message.key, diff));
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;

    let cancelled = false;
    (async () => {
      for (const [key, baseline] of snapshots) {
        const url = currentUrlByKey.get(key);
        if (!url) continue;

        try {
          const current = await fetch(cacheBust(url, cacheBustToken)).then((res) => res.blob());
          if (cancelled) return;

          const signature = `${await hashBaseline(baseline)}:${await hashBlob(current)}`;
          if (cancelled) return;

          const cached = diffCache.get(key);
          if (cached?.signature === signature) {
            setDiffs((prev) => (prev.get(key) === cached.diff ? prev : new Map(prev).set(key, cached.diff)));
            continue;
          }

          // Only show a spinner for screenshots never diffed before; otherwise the stale result stays
          // visible until the fresh one silently replaces it.
          if (!cached) setDiffs((prev) => new Map(prev).set(key, { status: 'pending' }));

          worker.postMessage({ key, signature, baseline, current });
        } catch {
          if (!cancelled) setDiffs((prev) => new Map(prev).set(key, { status: 'error' }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [snapshots, cacheBustToken]);

  return diffs;
}

// Object URLs for Blobs must be created/revoked explicitly, they aren't garbage collected on their own.
function useObjectUrl(blob: Blob | undefined) {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!blob) {
      setUrl(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return url;
}

// Focus state lives in the URL hash (not component state) so it survives HMR full-reloads, not just Fast Refresh.
function useHash() {
  const [hash, setHashState] = useState(() => window.location.hash.slice(1));

  useEffect(() => {
    const onHashChange = () => setHashState(window.location.hash.slice(1));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const setHash = useCallback((value: string) => {
    history.pushState(null, '', `#${value}`);
    setHashState(value);
  }, []);

  return [hash, setHash] as const;
}

type FocusState = { mode: 'screen'; category: string; viewport: Viewport } | { mode: 'viewport'; viewport: Viewport };

const buildScreenHash = (category: string, viewport: Viewport) => `screen/${category}/${viewport}`;
const buildViewportHash = (viewport: Viewport) => `viewport/${viewport}`;

function parseHash(hash: string): FocusState | null {
  const [mode, ...rest] = hash.split('/');

  if (mode === 'viewport' && rest.length === 1 && VIEWPORTS.includes(rest[0] as Viewport)) {
    return { mode: 'viewport', viewport: rest[0] as Viewport };
  }

  if (mode === 'screen' && rest.length === 2 && VIEWPORTS.includes(rest[1] as Viewport)) {
    return { mode: 'screen', category: rest[0], viewport: rest[1] as Viewport };
  }

  return null;
}

function DiffBadge({ diff, className = '' }: { diff: Diff | undefined; className?: string }) {
  if (!diff || diff.status === 'equal') return null;

  const base = `pointer-events-none rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ${className}`;
  if (diff.status === 'pending') return <span className={`${base} bg-neutral-700 text-neutral-300`}>diffing…</span>;
  if (diff.status === 'error') return <span className={`${base} bg-amber-600 text-white`}>diff error</span>;

  const percent = diff.ratio !== undefined ? `${(diff.ratio * 100).toFixed(1)}%` : '';
  return <span className={`${base} bg-red-600 text-white`}>Δ {percent}</span>;
}

// Stacks the diff image on top of the screenshot, hidden until the enclosing `group`-marked ancestor
// (the thumbnail button) is hovered, so hovering a changed thumbnail previews what changed.
function ThumbnailImage({
  src,
  diff,
  alt,
  className,
}: {
  src: string;
  diff: Diff | undefined;
  alt: string;
  className: string;
}) {
  return (
    <span className="relative block">
      <img src={src} alt={alt} className={className} />
      {diff?.diffUrl && (
        <img
          src={diff.diffUrl}
          alt={`${alt} - diff`}
          className={`${className} pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100`}
        />
      )}
      <DiffBadge diff={diff} className="absolute top-1 right-1 shadow" />
    </span>
  );
}

function ViewportButton({ viewport, active, onClick }: { viewport: Viewport; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded border px-3 py-1 text-sm ${
        active
          ? 'border-blue-400 bg-blue-950 text-blue-300'
          : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
      }`}>
      {VIEWPORT_LABELS[viewport]}
    </button>
  );
}

function DevScreenshots() {
  useBackground(false);
  const [hash, setHash] = useHash();
  const [cacheBustToken, refresh] = useCacheBustToken();
  const { snapshots, isCapturing, capture, clear } = useSnapshots();
  const diffs = useDiffs(snapshots, cacheBustToken);

  const withCacheBust = useMemo(() => (url: string) => cacheBust(url, cacheBustToken), [cacheBustToken]);

  if (!isDev()) return null;

  const focused = parseHash(hash);

  return (
    <div className="min-h-screen bg-neutral-900 p-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Visual regression screenshots</h1>
        <div className="flex gap-2">
          <button
            className="rounded border border-neutral-700 px-3 py-1 text-sm hover:border-neutral-500 disabled:opacity-50"
            disabled={isCapturing || sortedCategories.size === 0}
            onClick={capture}>
            {isCapturing ? 'Capturing…' : 'Capture snapshot'}
          </button>
          <button
            className="rounded border border-neutral-700 px-3 py-1 text-sm hover:border-neutral-500 disabled:opacity-50"
            disabled={snapshots.size === 0}
            onClick={clear}>
            Clear captured snapshots
          </button>
          <button
            className="rounded border border-neutral-700 px-3 py-1 text-sm hover:border-neutral-500"
            onClick={refresh}>
            Refresh images
          </button>
        </div>
      </div>

      {sortedCategories.size === 0 && (
        <p className="text-neutral-400">
          No screenshots found yet. Run <code>pnpm e2e:visual --update-snapshots</code> to generate some.
        </p>
      )}

      {focused?.mode === 'screen' && (
        <ScreenView
          category={focused.category}
          viewport={focused.viewport}
          setHash={setHash}
          withCacheBust={withCacheBust}
          snapshots={snapshots}
          diffs={diffs}
        />
      )}

      {focused?.mode === 'viewport' && (
        <ViewportView viewport={focused.viewport} setHash={setHash} withCacheBust={withCacheBust} diffs={diffs} />
      )}

      {!focused && <GridView setHash={setHash} withCacheBust={withCacheBust} diffs={diffs} />}
    </div>
  );
}

interface ViewProps {
  setHash: (value: string) => void;
  withCacheBust: (url: string) => string;
  diffs: Map<string, Diff>;
}

function GridView({ setHash, withCacheBust, diffs }: ViewProps) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-neutral-400">Browse by viewport:</span>
        {VIEWPORTS.map((viewport) => (
          <ViewportButton
            key={viewport}
            viewport={viewport}
            active={false}
            onClick={() => setHash(buildViewportHash(viewport))}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[...sortedCategories.entries()].map(([category, urls]) => (
          <div key={category} className="rounded border border-neutral-700 p-4">
            <h2 className="mb-3 truncate text-lg font-semibold" title={category}>
              {category}
            </h2>
            <div className="flex flex-wrap gap-3">
              {VIEWPORTS.map(
                (viewport) =>
                  urls[viewport] && (
                    <button
                      key={viewport}
                      onClick={() => setHash(buildScreenHash(category, viewport))}
                      className="group flex flex-col items-center gap-1">
                      <ThumbnailImage
                        src={withCacheBust(urls[viewport])}
                        diff={diffs.get(`${category}/${viewport}`)}
                        alt={`${category} - ${viewport}`}
                        className="h-24 w-auto rounded border border-neutral-700 object-cover object-top group-hover:border-blue-400"
                      />
                      <span className="text-xs text-neutral-400">{VIEWPORT_LABELS[viewport]}</span>
                    </button>
                  ),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenView({
  category,
  viewport,
  setHash,
  withCacheBust,
  snapshots,
  diffs,
}: ViewProps & { category: string; viewport: Viewport; snapshots: Map<string, Blob> }) {
  const urls = sortedCategories.get(category);
  const url = urls?.[viewport];
  const capturedBlob = snapshots.get(snapshotKey(category, viewport));
  const capturedUrl = useObjectUrl(capturedBlob);
  const diff = diffs.get(snapshotKey(category, viewport));

  const panels = 1 + (capturedUrl ? 1 : 0) + (diff?.diffUrl ? 1 : 0);
  const gridCols =
    panels >= 3 ? 'grid-cols-1 lg:grid-cols-3' : panels === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1';

  return (
    <div>
      <button className="mb-4 text-blue-400 underline" onClick={() => setHash('')}>
        ← Back to all screenshots
      </button>
      <h2 className="mb-4 flex items-center gap-3 text-xl font-semibold">
        {category}
        <DiffBadge diff={diff} />
      </h2>

      {url && (
        <div className={`mb-4 grid items-start gap-4 ${gridCols}`}>
          {capturedUrl && (
            <div className="min-w-0">
              <p className="mb-1 text-sm text-neutral-400">Captured (baseline)</p>
              <img
                src={capturedUrl}
                alt={`${category} - ${viewport} - captured`}
                className="w-full rounded border border-neutral-700"
              />
            </div>
          )}
          <div className="min-w-0">
            {capturedUrl && <p className="mb-1 text-sm text-neutral-400">Current</p>}
            <img
              src={withCacheBust(url)}
              alt={`${category} - ${viewport}`}
              className={
                capturedUrl
                  ? 'w-full rounded border border-neutral-700'
                  : 'max-w-full rounded border border-neutral-700'
              }
            />
          </div>
          {diff?.diffUrl && (
            <div className="min-w-0">
              <p className="mb-1 flex items-center gap-2 text-sm text-neutral-400">
                Diff
                {diff.mismatchedPixels !== undefined && (
                  <span className="text-neutral-500">{diff.mismatchedPixels.toLocaleString('en-US')} px</span>
                )}
              </p>
              <img
                src={diff.diffUrl}
                alt={`${category} - ${viewport} - diff`}
                className="w-full rounded border border-neutral-700"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {VIEWPORTS.map(
          (candidate) =>
            urls?.[candidate] && (
              <button
                key={candidate}
                onClick={() => setHash(buildScreenHash(category, candidate))}
                className="flex flex-col items-center gap-1">
                <img
                  src={withCacheBust(urls[candidate])}
                  alt={`${category} - ${candidate}`}
                  className={`h-24 w-auto rounded border object-cover object-top ${
                    candidate === viewport ? 'border-blue-400' : 'border-neutral-700 hover:border-neutral-500'
                  }`}
                />
                <span className={`text-xs ${candidate === viewport ? 'text-blue-300' : 'text-neutral-400'}`}>
                  {VIEWPORT_LABELS[candidate]}
                </span>
              </button>
            ),
        )}
      </div>
    </div>
  );
}

function ViewportView({ viewport, setHash, withCacheBust, diffs }: ViewProps & { viewport: Viewport }) {
  const entries = [...sortedCategories.entries()].filter(([, urls]) => urls[viewport]);

  return (
    <div>
      <button className="mb-4 text-blue-400 underline" onClick={() => setHash('')}>
        ← Back to all screenshots
      </button>
      <h2 className="mb-4 text-xl font-semibold">{VIEWPORT_LABELS[viewport]}</h2>
      <div className="mb-6 flex flex-wrap gap-2">
        {VIEWPORTS.map((candidate) => (
          <ViewportButton
            key={candidate}
            viewport={candidate}
            active={candidate === viewport}
            onClick={() => setHash(buildViewportHash(candidate))}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-6">
        {entries.map(([category, urls]) => (
          <button
            key={category}
            onClick={() => setHash(buildScreenHash(category, viewport))}
            className="group flex flex-col items-center gap-1">
            <ThumbnailImage
              src={withCacheBust(urls[viewport]!)}
              diff={diffs.get(`${category}/${viewport}`)}
              alt={`${category} - ${viewport}`}
              className="h-64 w-auto rounded border border-neutral-700 object-cover object-top group-hover:border-blue-400"
            />
            <span className="max-w-48 truncate text-xs text-neutral-400" title={category}>
              {category}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DevScreenshots;
