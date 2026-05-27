import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const SRC_ROOT = path.join(REPO_ROOT, 'src');
const IGNORED_DIRS = new Set(['.git', 'node_modules', 'build', 'dist', 'coverage', '.next', '.turbo']);
const IMPORTABLE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.mts',
  '.cjs',
  '.cts',
  '.json',
  '.css',
  '.scss',
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.mp3',
  '.ogg',
  '.wav',
  '.mp4',
  '.webm',
];
const UPDATABLE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.mts', '.cjs', '.cts', '.css', '.scss']);

const dryRun = process.argv.includes('--dry-run');
const skippedRenames: Array<{ source: string; reason: string }> = [];

const allFiles = walkFiles(REPO_ROOT);
const renameMap = new Map<string, string>();

for (const file of allFiles) {
  const parsed = path.parse(file);
  const snakeName = toSnakeCase(parsed.name);

  if (!snakeName || snakeName === parsed.name) continue;

  const target = path.join(parsed.dir, `${snakeName}${parsed.ext}`);
  if (target === file) continue;
  if (renameMap.has(file)) continue;
  if (fs.existsSync(target) && !renameMap.has(target)) {
    skippedRenames.push({
      source: file,
      reason: `target ${toRepoPath(target)} already exists`,
    });
    continue;
  }

  renameMap.set(file, target);
}

const targetUsage = new Map<string, string>();
for (const [oldPath, newPath] of renameMap) {
  const existing = targetUsage.get(newPath);
  if (existing) {
    skippedRenames.push({
      source: oldPath,
      reason: `rename collision with ${toRepoPath(existing)} -> ${toRepoPath(newPath)}`,
    });
    renameMap.delete(oldPath);
    continue;
  }
  targetUsage.set(newPath, oldPath);
}

const oldFilesSet = new Set(allFiles);
const renamedTargetSet = new Set(renameMap.values());
const newToOldMap = new Map<string, string>();

for (const [oldPath, newPath] of renameMap) {
  if (!dryRun) {
    fs.renameSync(oldPath, newPath);
  }
  newToOldMap.set(newPath, oldPath);
}

const filesAfterRename = dryRun ? allFiles.map((file) => renameMap.get(file) ?? file) : walkFiles(REPO_ROOT);

let touchedFiles = 0;

for (const file of filesAfterRename) {
  if (!UPDATABLE_EXTENSIONS.has(path.extname(file))) continue;

  const oldImporterPath = newToOldMap.get(file) ?? file;
  const content = fs.readFileSync(file, 'utf8');

  const updated = content.replace(
    /((?:from|import|require)\s*\(?\s*['"])([^'"]+)(['"]\)?)/g,
    (match, start, specifier, end) => {
      const rewritten = rewriteSpecifier(specifier, file, oldImporterPath, oldFilesSet, renameMap);
      if (!rewritten || rewritten === specifier) return match;
      return `${start}${rewritten}${end}`;
    },
  );

  if (updated !== content) {
    if (!dryRun) {
      fs.writeFileSync(file, updated, 'utf8');
    }
    touchedFiles += 1;
  }
}

console.log(
  `Renamed ${renameMap.size} files${dryRun ? ' (dry run)' : ''} and updated imports in ${touchedFiles} files. Skipped ${skippedRenames.length} renames.`,
);

if (dryRun) {
  for (const [oldPath, newPath] of renameMap) {
    console.log(`${toRepoPath(oldPath)} -> ${toRepoPath(newPath)}`);
  }
}

for (const { source, reason } of skippedRenames) {
  console.warn(`Skipped ${toRepoPath(source)}: ${reason}`);
}

function walkFiles(rootDir: string): string[] {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name === '.' || entry.name === '..') continue;
    if (entry.isDirectory() && IGNORED_DIRS.has(entry.name)) continue;

    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function toSnakeCase(name: string): string {
  if (!/[A-Z]/.test(name)) return '';

  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function rewriteSpecifier(
  specifier: string,
  importerNewPath: string,
  importerOldPath: string,
  oldFilesSet: Set<string>,
  renameMap: Map<string, string>,
): string | null {
  if (
    (!specifier.startsWith('./') && !specifier.startsWith('../') && !specifier.startsWith('~/')) ||
    specifier.includes('?')
  ) {
    return null;
  }

  const resolvedOld = resolveSpecifier(importerOldPath, specifier, oldFilesSet);
  if (!resolvedOld) return null;

  const resolvedNew = renameMap.get(resolvedOld) ?? resolvedOld;
  if (resolvedNew === resolvedOld && !renamedTargetSet.has(importerNewPath)) return null;

  const keepExtension = hasKnownImportExtension(specifier);
  if (specifier.startsWith('~/')) {
    if (!resolvedNew.startsWith(SRC_ROOT)) return null;
    let aliasPath = toPosix(path.relative(SRC_ROOT, resolvedNew));
    if (!keepExtension) aliasPath = stripExtension(aliasPath);
    return `~/${aliasPath}`;
  }

  let relativePath = toPosix(path.relative(path.dirname(importerNewPath), resolvedNew));
  if (!relativePath.startsWith('.')) relativePath = `./${relativePath}`;
  if (!keepExtension) relativePath = stripExtension(relativePath);

  return relativePath;
}

function resolveSpecifier(importerPath: string, specifier: string, oldFilesSet: Set<string>): string | null {
  const hasExtension = hasKnownImportExtension(specifier);
  const basePath = specifier.startsWith('~/')
    ? path.resolve(SRC_ROOT, specifier.slice(2))
    : path.resolve(path.dirname(importerPath), specifier);

  if (hasExtension) {
    return oldFilesSet.has(basePath) ? basePath : null;
  }

  if (oldFilesSet.has(basePath)) return basePath;

  for (const ext of IMPORTABLE_EXTENSIONS) {
    const candidate = `${basePath}${ext}`;
    if (oldFilesSet.has(candidate)) return candidate;
  }

  for (const ext of IMPORTABLE_EXTENSIONS) {
    const candidate = path.join(basePath, `index${ext}`);
    if (oldFilesSet.has(candidate)) return candidate;
  }

  return null;
}

function hasKnownImportExtension(specifier: string): boolean {
  return IMPORTABLE_EXTENSIONS.some((extension) => specifier.endsWith(extension));
}

function stripExtension(value: string): string {
  return value.replace(/\.[^./]+$/, '');
}

function toPosix(value: string): string {
  return value.split(path.sep).join('/');
}

function toRepoPath(absolutePath: string): string {
  return toPosix(path.relative(REPO_ROOT, absolutePath));
}
