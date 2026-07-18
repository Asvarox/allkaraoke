import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Renders the thumbnail gallery markdown that gets appended to the "visual
 * changes" PR comment. Reads the report produced by {@link ./buildDiffReport}
 * and turns each changed snapshot into a collapsible `<details>` block with an
 * old / new / diff table. Image URLs are resolved against `BASE_URL` (where the
 * report was uploaded). Writes the markdown to `comment.md` next to the report.
 *
 * Kept separate from report generation because the upload URL is only known
 * after the images have been hosted.
 */

const OUTPUT_DIR = 'test-results/visual-diff-report';
const THUMBNAIL_WIDTH = 320;

interface ReportEntry {
  index: number;
  name: string;
  status: 'modified' | 'added' | 'removed';
  hasOld: boolean;
  hasNew: boolean;
  hasDiff: boolean;
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

const trimSlash = (value: string) => value.replace(/\/+$/, '');

function img(baseUrl: string, index: number, file: string, present: boolean): string {
  if (!present) return '—';
  return `<img src="${trimSlash(baseUrl)}/${index}/${file}" width="${THUMBNAIL_WIDTH}" />`;
}

function summaryLabel(entry: ReportEntry): string {
  if (entry.status === 'added') return `${entry.name} — 🟢 new snapshot`;
  if (entry.status === 'removed') return `${entry.name} — 🔴 removed`;

  if (entry.ratio !== undefined && entry.mismatchedPixels !== undefined) {
    const percent = (entry.ratio * 100).toFixed(2);
    return `${entry.name} — ${percent}% changed (${entry.mismatchedPixels.toLocaleString('en-US')} px)`;
  }
  return `${entry.name} — changed`;
}

function renderEntry(entry: ReportEntry, baseUrl: string): string {
  return [
    '<details>',
    `<summary>${summaryLabel(entry)}</summary>`,
    '',
    '| Old | New | Diff |',
    '| --- | --- | --- |',
    `| ${img(baseUrl, entry.index, 'old.png', entry.hasOld)} | ${img(baseUrl, entry.index, 'new.png', entry.hasNew)} | ${img(baseUrl, entry.index, 'diff.png', entry.hasDiff)} |`,
    '',
    '</details>',
  ].join('\n');
}

function render(report: Report, baseUrl: string | undefined): string {
  if (report.truncated) {
    return `\n\n> ℹ️ ${report.changedCount} snapshots changed — too many to preview inline (thumbnails are shown when fewer than 10 change).`;
  }

  if (!report.hasThumbnails || !baseUrl) return '';

  const header = `\n\n### Changed snapshots (${report.entries.length})\n`;
  return header + '\n' + report.entries.map((entry) => renderEntry(entry, baseUrl)).join('\n\n');
}

function main(): void {
  const reportPath = join(OUTPUT_DIR, 'report.json');
  const commentPath = join(OUTPUT_DIR, 'comment.md');

  if (!existsSync(reportPath)) {
    writeFileSync(commentPath, '');
    return;
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as Report;
  const baseUrl = process.env.BASE_URL?.trim();

  writeFileSync(commentPath, render(report, baseUrl));
}

main();
