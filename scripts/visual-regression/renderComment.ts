import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Renders the snippet appended to the "visual changes" PR comment: a one-line
 * link to the hosted gallery page built by {@link ./buildDiffReport}, resolved
 * against `BASE_URL` (where the report was uploaded). Writes the markdown to
 * `comment.md` next to the report.
 *
 * The thumbnails themselves live on the gallery page, so the comment stays a
 * fixed size no matter how many snapshots changed.
 *
 * Kept separate from report generation because the upload URL is only known
 * after the report has been hosted.
 */

const OUTPUT_DIR = 'test-results/visual-diff-report';

interface Report {
  changedCount: number;
  hasReport: boolean;
  entries: unknown[];
}

const trimSlash = (value: string) => value.replace(/\/+$/, '');

function render(report: Report, baseUrl: string | undefined): string {
  if (!report.hasReport) return '';

  const count = `${report.changedCount} snapshot${report.changedCount === 1 ? '' : 's'} changed`;

  if (!baseUrl) {
    return `\n\n> ℹ️ ${count} — the preview gallery could not be uploaded, see the run logs.`;
  }

  return `\n\n📸 **[View the ${count} (old / new / diff)](${trimSlash(baseUrl)}/index.html)**`;
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
