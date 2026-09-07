/**
 * Renders the standalone HTML gallery page for a visual-diff report. The page
 * is written next to the per-snapshot image folders and references them with
 * relative URLs, so it works from any static host (and locally).
 *
 * Unlike the PR comment (see {@link ./renderComment}) the page has no limit on
 * how many snapshots it shows - the comment only links here.
 */

export type Status = 'modified' | 'added' | 'removed';

export interface GalleryEntry {
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

export interface GalleryMeta {
  /** Link back to the CI run that produced the report, when known. */
  runUrl?: string;
  /** Branch the snapshots were updated on, when known. */
  branch?: string;
  generatedAt: string;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function cell(entry: GalleryEntry, file: string, present: boolean, label: string): string {
  if (!present) return '<td class="cell empty">—</td>';
  const src = `${entry.index}/${file}`;
  return `<td class="cell"><a href="${src}" target="_blank" rel="noreferrer"><img src="${src}" alt="${escapeHtml(`${label} ${entry.name}`)}" loading="lazy" /></a></td>`;
}

function statusLabel(entry: GalleryEntry): string {
  if (entry.status === 'added') return '<span class="badge added">new</span>';
  if (entry.status === 'removed') return '<span class="badge removed">removed</span>';

  if (entry.ratio !== undefined && entry.mismatchedPixels !== undefined) {
    const percent = (entry.ratio * 100).toFixed(2);
    return `<span class="badge modified">${percent}% changed</span><span class="pixels">${entry.mismatchedPixels.toLocaleString('en-US')} px</span>`;
  }
  return '<span class="badge modified">changed</span>';
}

function row(entry: GalleryEntry): string {
  return [
    `<tr id="snapshot-${entry.index}">`,
    `<td class="meta"><a class="name" href="#snapshot-${entry.index}">${escapeHtml(entry.name)}</a><code class="path">${escapeHtml(entry.path)}</code>${statusLabel(entry)}</td>`,
    cell(entry, 'old.png', entry.hasOld, 'Old'),
    cell(entry, 'new.png', entry.hasNew, 'New'),
    cell(entry, 'diff.png', entry.hasDiff, 'Diff'),
    '</tr>',
  ].join('');
}

const STYLES = `
:root { color-scheme: light dark; --bg: #ffffff; --fg: #1f2328; --muted: #656d76; --border: #d1d9e0; --panel: #f6f8fa; }
@media (prefers-color-scheme: dark) {
  :root { --bg: #0d1117; --fg: #e6edf3; --muted: #8b949e; --border: #30363d; --panel: #161b22; }
}
* { box-sizing: border-box; }
body { margin: 0; padding: 24px; background: var(--bg); color: var(--fg); font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
h1 { font-size: 20px; margin: 0 0 4px; }
header .sub { color: var(--muted); margin-bottom: 16px; }
header a { color: inherit; }
.filters { display: flex; gap: 8px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.filters input { flex: 1 1 260px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--panel); color: inherit; }
.filters label { color: var(--muted); display: flex; gap: 6px; align-items: center; }
.table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 8px; }
table { border-collapse: collapse; width: 100%; }
thead th { position: sticky; top: 0; background: var(--panel); text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--border); font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); z-index: 1; }
tbody tr + tr { border-top: 1px solid var(--border); }
td { padding: 12px; vertical-align: top; }
td.meta { min-width: 220px; max-width: 320px; }
td.cell { text-align: center; }
td.cell img { max-width: 100%; width: var(--thumb, 320px); border: 1px solid var(--border); border-radius: 4px; background: var(--panel); }
td.empty { color: var(--muted); }
.name { display: block; font-weight: 600; word-break: break-word; color: inherit; text-decoration: none; }
.path { display: block; color: var(--muted); font-size: 11px; word-break: break-all; margin: 4px 0 8px; }
.badge { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 12px; border: 1px solid var(--border); }
.badge.added { background: #1a7f37; border-color: #1a7f37; color: #fff; }
.badge.removed { background: #cf222e; border-color: #cf222e; color: #fff; }
.pixels { display: block; color: var(--muted); font-size: 11px; margin-top: 4px; }
.empty-state { padding: 32px; text-align: center; color: var(--muted); }
`;

const SCRIPT = `
const search = document.getElementById('search');
const size = document.getElementById('size');
const rows = Array.from(document.querySelectorAll('tbody tr'));
const empty = document.getElementById('no-matches');
function applyFilter() {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  for (const row of rows) {
    const match = !query || row.dataset.search.includes(query);
    row.hidden = !match;
    if (match) visible++;
  }
  empty.hidden = visible > 0;
}
search.addEventListener('input', applyFilter);
size.addEventListener('input', () => {
  document.documentElement.style.setProperty('--thumb', size.value + 'px');
});
`;

export function renderGalleryHtml(entries: GalleryEntry[], meta: GalleryMeta): string {
  const runLink = meta.runUrl ? ` · <a href="${escapeHtml(meta.runUrl)}">CI run</a>` : '';
  const branch = meta.branch ? ` on <code>${escapeHtml(meta.branch)}</code>` : '';

  const body =
    entries.length === 0
      ? '<p class="empty-state">No snapshot changes in this run.</p>'
      : [
          '<div class="filters">',
          '<input id="search" type="search" placeholder="Filter by snapshot name or path…" />',
          '<label>Thumbnail size <input id="size" type="range" min="120" max="900" value="320" /></label>',
          '</div>',
          '<div class="table-wrap"><table>',
          '<thead><tr><th>Snapshot</th><th>Old</th><th>New</th><th>Diff</th></tr></thead>',
          '<tbody>',
          ...entries.map((entry) =>
            row(entry).replace('<tr ', `<tr data-search="${escapeHtml(`${entry.name} ${entry.path}`.toLowerCase())}" `),
          ),
          '</tbody></table></div>',
          '<p class="empty-state" id="no-matches" hidden>No snapshots match the filter.</p>',
        ].join('\n');

  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    '<meta name="robots" content="noindex" />',
    `<title>Visual changes (${entries.length})</title>`,
    `<style>${STYLES}</style>`,
    '</head>',
    '<body>',
    '<header>',
    `<h1>Visual changes (${entries.length})</h1>`,
    `<div class="sub">Updated snapshots${branch}, generated ${escapeHtml(meta.generatedAt)}${runLink}</div>`,
    '</header>',
    body,
    entries.length > 0 ? `<script>${SCRIPT}</script>` : '',
    '</body>',
    '</html>',
  ].join('\n');
}
