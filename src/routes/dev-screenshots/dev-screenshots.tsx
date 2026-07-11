import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBackground } from '~/modules/elements/background-context';
import isDev from '~/modules/utils/is-dev';
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

// e.g. "edit-song-basic-info-mobile-portrait-chromium-darwin.png" -> category "edit-song-basic-info", viewport "mobile-portrait"
const FILE_NAME_RE = new RegExp(`^(.*)-(${VIEWPORTS.join('|')})-[^/]+\\.png$`);

function parseFileName(modulePath: string) {
  const fileName = modulePath.split('/').pop() ?? '';
  const match = fileName.match(FILE_NAME_RE);
  if (!match) return null;
  return { category: match[1], viewport: match[2] as Viewport };
}

const categories = new Map<string, Partial<Record<Viewport, string>>>();
for (const [modulePath, url] of Object.entries(screenshotUrls)) {
  const parsed = parseFileName(modulePath);
  if (!parsed) continue;

  const bucket = categories.get(parsed.category) ?? {};
  bucket[parsed.viewport] = url;
  categories.set(parsed.category, bucket);
}
const sortedCategories = new Map([...categories.entries()].sort(([a], [b]) => a.localeCompare(b)));

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

  const withCacheBust = useMemo(
    () => (url: string) => `${url}${url.includes('?') ? '&' : '?'}t=${cacheBustToken}`,
    [cacheBustToken],
  );

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
        />
      )}

      {focused?.mode === 'viewport' && (
        <ViewportView viewport={focused.viewport} setHash={setHash} withCacheBust={withCacheBust} />
      )}

      {!focused && <GridView setHash={setHash} withCacheBust={withCacheBust} />}
    </div>
  );
}

interface ViewProps {
  setHash: (value: string) => void;
  withCacheBust: (url: string) => string;
}

function GridView({ setHash, withCacheBust }: ViewProps) {
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
                      className="flex flex-col items-center gap-1">
                      <img
                        src={withCacheBust(urls[viewport])}
                        alt={`${category} - ${viewport}`}
                        className="h-24 w-auto rounded border border-neutral-700 object-cover object-top hover:border-blue-400"
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
}: ViewProps & { category: string; viewport: Viewport; snapshots: Map<string, Blob> }) {
  const urls = sortedCategories.get(category);
  const url = urls?.[viewport];
  const capturedBlob = snapshots.get(snapshotKey(category, viewport));
  const capturedUrl = useObjectUrl(capturedBlob);

  return (
    <div>
      <button className="mb-4 text-blue-400 underline" onClick={() => setHash('')}>
        ← Back to all screenshots
      </button>
      <h2 className="mb-4 text-xl font-semibold">{category}</h2>

      {url && (
        <div className={`mb-4 grid items-start gap-4 ${capturedUrl ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {capturedUrl && (
            <div className="min-w-0">
              <p className="mb-1 text-sm text-neutral-400">Captured</p>
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

function ViewportView({ viewport, setHash, withCacheBust }: ViewProps & { viewport: Viewport }) {
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
            className="flex flex-col items-center gap-1">
            <img
              src={withCacheBust(urls[viewport]!)}
              alt={`${category} - ${viewport}`}
              className="h-64 w-auto rounded border border-neutral-700 object-cover object-top hover:border-blue-400"
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
