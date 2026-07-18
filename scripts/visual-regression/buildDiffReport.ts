import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { diffImages } from './imageDiff';
import { decodePng, writePng } from './pngIo';

/**
 * Builds a visual-diff thumbnail report for snapshots changed in the working
 * tree (relative to HEAD). For each changed snapshot it writes the old, new and
 * diff PNGs into a per-image folder under {@link OUTPUT_DIR}, plus a
 * `report.json` describing them. The report is only populated when fewer than
 * {@link MAX_THUMBNAILS} snapshots changed — beyond that a gallery is noise.
 *
 * Meant to run in CI right after `playwright test -u`, before the snapshots are
 * committed. The output lives under `test-results/` (gitignored), so it is never
 * committed and can be uploaded to a static host and linked from the PR comment.
 */

/** Show thumbnails only when strictly fewer than this many snapshots changed. */
const MAX_THUMBNAILS = 10;
const OUTPUT_DIR = 'test-results/visual-diff-report';

type Status = 'modified' | 'added' | 'removed';

interface ChangedSnapshot {
  /** Repo-relative path of the snapshot. */
  path: string;
  status: Status;
}

interface ReportEntry {
  index: number;
  name: string;
  path: string;
  status: Status;
  hasOld: boolean;
  hasNew: boolean;
  hasDiff: boolean;
  width?: number;
  height?: number;
  mismatchedPixels?: number;
  totalPixels?: number;
  ratio?: number;
}

interface Report {
  changedCount: number;
  hasThumbnails: boolean;
  truncated: boolean;
  entries: ReportEntry[];
}

// Playwright screenshot snapshots live in `*-snapshots/` (visual-regression
// tests) or `__snapshots__/` (component tests, per playwright-ct.config.mts).
const isSnapshot = (path: string) =>
  path.endsWith('.png') && (path.includes('-snapshots/') || path.includes('__snapshots__/'));

/** Lists snapshot PNGs that differ from HEAD in the working tree. */
function listChangedSnapshots(): ChangedSnapshot[] {
  const output = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });

  const changed: ChangedSnapshot[] = [];
  for (const line of output.split('\n')) {
    if (!line) continue;
    const code = line.slice(0, 2);
    // Renames look like `R  old -> new`; we only care about the destination.
    const pathPart = line.slice(3).split(' -> ').pop()!.trim().replace(/^"|"$/g, '');
    if (!isSnapshot(pathPart)) continue;

    let status: Status = 'modified';
    if (code === '??' || code.includes('A')) status = 'added';
    else if (code.includes('D')) status = 'removed';

    changed.push({ path: pathPart, status });
  }

  return changed.sort((a, b) => a.path.localeCompare(b.path));
}

/** Reads a file's committed contents at HEAD (the "before" snapshot), or null. */
function readAtHead(path: string): Buffer | null {
  try {
    return execFileSync('git', ['show', `HEAD:${path}`], {
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

function main(): void {
  const changed = listChangedSnapshots();
  const changedCount = changed.length;

  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const withinLimit = changedCount > 0 && changedCount < MAX_THUMBNAILS;
  const report: Report = {
    changedCount,
    hasThumbnails: false,
    truncated: changedCount >= MAX_THUMBNAILS,
    entries: [],
  };

  if (withinLimit) {
    changed.forEach((snapshot, index) => {
      const entryDir = join(OUTPUT_DIR, String(index));
      mkdirSync(entryDir, { recursive: true });

      const oldBuffer = snapshot.status === 'added' ? null : readAtHead(snapshot.path);
      const newBuffer = snapshot.status === 'removed' ? null : readWorkingTree(snapshot.path);

      const entry: ReportEntry = {
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

    report.hasThumbnails = report.entries.length > 0;
  }

  writeFileSync(join(OUTPUT_DIR, 'report.json'), JSON.stringify(report, null, 2));

  setOutput('changed_count', String(changedCount));
  setOutput('has_thumbnails', String(report.hasThumbnails));

  console.log(
    `Visual diff report: ${changedCount} changed snapshot(s), ` +
      `thumbnails ${report.hasThumbnails ? `generated for ${report.entries.length}` : 'skipped'}.`,
  );
}

main();
