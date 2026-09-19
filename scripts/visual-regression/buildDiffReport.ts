import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseArgs } from 'node:util';

import { diffImages } from '../../src/modules/utils/image-diff';
import { decodePng, writePng } from './pngIo';
import { type GalleryEntry, renderGalleryHtml } from './renderGalleryHtml';

/**
 * Builds a visual-diff report for the snapshots the test jobs changed. For each
 * changed snapshot it writes the old, new and diff PNGs into a per-image folder
 * under {@link OUTPUT_DIR}, plus a `report.json` describing them and an
 * `index.html` gallery page that shows all of them side by side. Every changed
 * snapshot is included - the page is hosted, not inlined into a PR comment, so
 * there is no reason to cap it.
 *
 * Usage: `buildDiffReport.ts --snapshots <dir> --base <git ref>`
 *
 * `<dir>` holds only the changed snapshots at their repo-relative paths - the
 * merged `changed-snapshots-*` artifacts uploaded by the test jobs (see
 * .github/templates/upload-changed-snapshots). The "old" image is read from
 * `<git ref>` (the PR's target branch), so the report always shows the full
 * diff against it - not just whatever a previous CI run on this branch happened
 * to auto-commit.
 *
 * The output lives under `test-results/` (gitignored), so it is never committed
 * and can be uploaded to a static host and linked from the PR comment.
 */

const OUTPUT_DIR = 'test-results/visual-diff-report';

interface Report {
  changedCount: number;
  hasReport: boolean;
  entries: GalleryEntry[];
}

/** Lists the PNGs under `dir`, as paths relative to it (= repo-relative paths). */
function listChangedSnapshots(dir: string): string[] {
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((path) => path.endsWith('.png'))
    .sort((a, b) => a.localeCompare(b));
}

/** Reads a file's contents at the given git ref (the "before" snapshot), or null if it isn't there. */
function readFromRef(ref: string, path: string): Buffer | null {
  try {
    return execFileSync('git', ['show', `${ref}:${path}`], {
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
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
  const { values } = parseArgs({ options: { snapshots: { type: 'string' }, base: { type: 'string' } } });
  const { snapshots: snapshotsDir, base: baseRef } = values;
  if (!snapshotsDir || !baseRef) {
    throw new Error('Usage: buildDiffReport.ts --snapshots <dir> --base <git ref>');
  }

  const changed = listChangedSnapshots(snapshotsDir);
  const changedCount = changed.length;

  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const report: Report = { changedCount, hasReport: changedCount > 0, entries: [] };

  changed.forEach((path, index) => {
    const entryDir = join(OUTPUT_DIR, String(index));
    mkdirSync(entryDir, { recursive: true });

    const oldBuffer = readFromRef(baseRef, path);
    const newBuffer = readFileSync(join(snapshotsDir, path));

    const entry: GalleryEntry = {
      index,
      name: basename(path),
      path,
      status: oldBuffer ? 'modified' : 'added',
      hasOld: false,
      hasNew: true,
      hasDiff: false,
    };

    if (oldBuffer) {
      writeFileSync(join(entryDir, 'old.png'), oldBuffer);
      entry.hasOld = true;
    }
    writeFileSync(join(entryDir, 'new.png'), newBuffer);

    if (oldBuffer) {
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
        console.warn(`Failed to diff ${path}:`, error);
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
