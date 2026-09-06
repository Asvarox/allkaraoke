import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { diffImages } from '../../src/modules/utils/image-diff';
import { decodePng, writePng } from './pngIo';
import { type GalleryEntry, renderGalleryHtml } from './renderGalleryHtml';

/**
 * Builds a visual-diff report for snapshots changed in the working tree
 * (relative to the index). For each changed snapshot it writes the old, new and
 * diff PNGs into a per-image folder under {@link OUTPUT_DIR}, plus a
 * `report.json` describing them and an `index.html` gallery page that shows all
 * of them side by side. Every changed snapshot is included - the page is hosted,
 * not inlined into a PR comment, so there is no reason to cap it.
 *
 * Meant to run in CI right after `playwright test -u`, before the snapshots are
 * committed. The output lives under `test-results/` (gitignored), so it is never
 * committed and can be uploaded to a static host and linked from the PR comment.
 *
 * The index is expected to already hold the PR's target branch's snapshots at
 * this point (see the 'Reset snapshot baseline to target branch' CI step that
 * runs before Playwright), so the "old" image here is the target branch's
 * version - not just whatever a previous CI run on this branch happened to
 * auto-commit.
 */

const OUTPUT_DIR = 'test-results/visual-diff-report';

type Status = 'modified' | 'added' | 'removed';

interface ChangedSnapshot {
  /** Repo-relative path of the snapshot. */
  path: string;
  status: Status;
}

interface Report {
  changedCount: number;
  hasReport: boolean;
  entries: GalleryEntry[];
}

// Playwright screenshot snapshots live in `*-snapshots/` (visual-regression
// tests) or `__snapshots__/` (component tests, per playwright-ct.config.mts).
const isSnapshot = (path: string) =>
  path.endsWith('.png') && (path.includes('-snapshots/') || path.includes('__snapshots__/'));

/** Lists snapshot PNGs that differ from the index in the working tree. */
function listChangedSnapshots(): ChangedSnapshot[] {
  const output = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });

  const changed = new Map<string, Status>();
  for (const line of output.split('\n')) {
    if (!line) continue;
    const code = line.slice(0, 2);
    // Renames look like `R  old -> new`; we only care about the destination.
    const pathPart = line.slice(3).split(' -> ').pop()!.trim().replace(/^"|"$/g, '');
    if (!isSnapshot(pathPart)) continue;

    // Only the worktree column (Y) reflects an actual diff against the index
    // - which the CI sync step resets to the target branch before Playwright
    // runs. The staged column (X) just reflects that reset's index-vs-HEAD
    // noise: e.g. "M " means the index was rewritten to the target branch's
    // content, but the fresh render still matches it - not a real change.
    const worktreeStatus = code === '??' ? '?' : code[1];
    if (worktreeStatus === ' ' || worktreeStatus === undefined) continue;

    let status: Status = 'modified';
    if (worktreeStatus === '?') status = 'added';
    else if (worktreeStatus === 'D') status = 'removed';

    changed.set(pathPart, status);
  }

  return Array.from(changed, ([path, status]) => ({ path, status })).sort((a, b) => a.path.localeCompare(b.path));
}

/** Reads a file's staged (index) contents (the "before" snapshot), or null. */
function readFromIndex(path: string): Buffer | null {
  try {
    return execFileSync('git', ['show', `:${path}`], {
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

/**
 * Reads the current on-disk contents (the "after" snapshot). Uses the working
 * tree rather than the git index, because `playwright test -u` leaves updated
 * snapshots unstaged — the index would still hold the old version.
 */
function readWorkingTree(path: string): Buffer | null {
  return existsSync(path) ? readFileSync(path) : null;
}

function setOutput(name: string, value: string): void {
  const file = process.env.GITHUB_OUTPUT;
  if (file) appendFileSync(file, `${name}=${value}\n`);
}

function runUrl(): string | undefined {
  const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
  if (!GITHUB_SERVER_URL || !GITHUB_REPOSITORY || !GITHUB_RUN_ID) return undefined;
  return `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;
}

function main(): void {
  const changed = listChangedSnapshots();
  const changedCount = changed.length;

  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const report: Report = { changedCount, hasReport: changedCount > 0, entries: [] };

  changed.forEach((snapshot, index) => {
    const entryDir = join(OUTPUT_DIR, String(index));
    mkdirSync(entryDir, { recursive: true });

    const oldBuffer = snapshot.status === 'added' ? null : readFromIndex(snapshot.path);
    const newBuffer = snapshot.status === 'removed' ? null : readWorkingTree(snapshot.path);

    const entry: GalleryEntry = {
      index,
      name: basename(snapshot.path),
      path: snapshot.path,
      status: snapshot.status,
      hasOld: false,
      hasNew: false,
      hasDiff: false,
    };

    if (oldBuffer) {
      writeFileSync(join(entryDir, 'old.png'), oldBuffer);
      entry.hasOld = true;
    }
    if (newBuffer) {
      writeFileSync(join(entryDir, 'new.png'), newBuffer);
      entry.hasNew = true;
    }

    if (oldBuffer && newBuffer) {
      try {
        const result = diffImages(decodePng(oldBuffer), decodePng(newBuffer));
        writePng(join(entryDir, 'diff.png'), result);
        entry.hasDiff = true;
        entry.width = result.width;
        entry.height = result.height;
        entry.mismatchedPixels = result.mismatchedPixels;
        entry.totalPixels = result.totalPixels;
        entry.ratio = result.ratio;
      } catch (error) {
        console.warn(`Failed to diff ${snapshot.path}:`, error);
      }
    }

    report.entries.push(entry);
  });

  writeFileSync(join(OUTPUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  writeFileSync(
    join(OUTPUT_DIR, 'index.html'),
    renderGalleryHtml(report.entries, {
      runUrl: runUrl(),
      branch: process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME,
      generatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
    }),
  );

  setOutput('changed_count', String(changedCount));
  setOutput('has_report', String(report.hasReport));

  console.log(`Visual diff report: ${changedCount} changed snapshot(s), gallery page written to ${OUTPUT_DIR}.`);
}

main();
