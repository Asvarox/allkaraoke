import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const SRC_ROOT = path.join(REPO_ROOT, 'src');
const IGNORED_DIRS = new Set(['.git', 'node_modules', '.agents', 'build', 'dist', 'coverage', '.github', '.next', '.turbo', 'out', '.vercel', '.cache', '.playwright', 'playwright-report', '.storybook', 'storybook-static']);
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

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const showHelp = args.includes('--help') || args.includes('-h');
const unknownArgs = args.filter((arg) => !['--dry-run', '--help', '-h'].includes(arg));

if (showHelp) {
  console.log('Usage: pnpm ts-node scripts/rename-to-camel-case.ts [--dry-run]');
  process.exit(0);
}

if (unknownArgs.length > 0) {
  throw new Error(`Unknown arguments: ${unknownArgs.join(', ')}`);
}
const skippedRenames: Array<{ source: string; reason: string }> = [];
const failedRenames: Array<{ source: string; target: string; reason: string }> = [];

const { files: allFiles, directories: allDirectories } = walkWorkspace(REPO_ROOT);
const fileRenameOperations = new Map<string, string>();

for (const file of allFiles) {
  const parsed = path.parse(file);
  const snakeName = toSnakeCase(parsed.name);

  if (snakeName === parsed.name) continue;

  const target = path.join(parsed.dir, `${snakeName}${parsed.ext}`);
  if (target === file) continue;
  if (fileRenameOperations.has(file)) continue;
  const isCaseOnlyTarget = isCaseOnlyPathRename(file, target);
  if (fs.existsSync(target) && !fileRenameOperations.has(target) && !isCaseOnlyTarget) {
    skippedRenames.push({
      source: file,
      reason: `target ${toRepoPath(target)} already exists`,
    });
    continue;
  }

  fileRenameOperations.set(file, target);
}

const fileTargetUsage = new Map<string, string>();
for (const [oldPath, newPath] of fileRenameOperations) {
  const existing = fileTargetUsage.get(newPath);
  if (existing) {
    skippedRenames.push({
      source: oldPath,
      reason: `rename collision with ${toRepoPath(existing)} -> ${toRepoPath(newPath)}`,
    });
    fileRenameOperations.delete(oldPath);
    continue;
  }
  fileTargetUsage.set(newPath, oldPath);
}

const directoryRenameOperations = new Map<string, string>();

for (const directory of allDirectories) {
  const target = normalizeDirectoryPath(directory);
  if (target === directory) continue;

  const isCaseOnlyTarget = isCaseOnlyPathRename(directory, target);
  if (fs.existsSync(target) && !directoryRenameOperations.has(target) && !isCaseOnlyTarget) {
    skippedRenames.push({
      source: directory,
      reason: `target ${toRepoPath(target)} already exists`,
    });
    continue;
  }

  directoryRenameOperations.set(directory, target);
}

const directoryTargetUsage = new Map<string, string>();
for (const [oldPath, newPath] of directoryRenameOperations) {
  const existing = directoryTargetUsage.get(newPath);
  if (existing) {
    skippedRenames.push({
      source: oldPath,
      reason: `rename collision with ${toRepoPath(existing)} -> ${toRepoPath(newPath)}`,
    });
    directoryRenameOperations.delete(oldPath);
    continue;
  }
  directoryTargetUsage.set(newPath, oldPath);
}

const directoryRenamesForPathMapping = Array.from(directoryRenameOperations.entries()).sort(
  ([leftSource], [rightSource]) => rightSource.length - leftSource.length,
);
const directoryRenamesForExecution = Array.from(directoryRenameOperations.entries()).sort(
  ([leftSource], [rightSource]) => leftSource.length - rightSource.length,
);

const finalFilePathsByOriginalPath = new Map<string, string>();
for (const file of allFiles) {
  const pathAfterFileRename = fileRenameOperations.get(file) ?? file;
  const finalFilePath = applyDirectoryRenames(pathAfterFileRename, directoryRenamesForPathMapping);
  if (finalFilePath !== file) {
    finalFilePathsByOriginalPath.set(file, finalFilePath);
  }
}

const oldFilesSet = new Set(allFiles);
let renamedTargetSet = new Set<string>();
const successfulFileRenameOperations = new Map<string, string>();

for (const [oldPath, newPath] of fileRenameOperations) {
  if (!dryRun) {
    try {
      renamePathSafely(oldPath, newPath);
      successfulFileRenameOperations.set(oldPath, newPath);
    } catch (error) {
      failedRenames.push({
        source: oldPath,
        target: newPath,
        reason: getErrorMessage(error),
      });
    }
    continue;
  }

  successfulFileRenameOperations.set(oldPath, newPath);
}

const successfulDirectoryRenames: Array<[string, string]> = [];
for (const [oldPath, newPath] of directoryRenamesForExecution) {
  if (!dryRun) {
    const currentSourcePath = applyDirectoryRenames(oldPath, successfulDirectoryRenames);
    const currentTargetPath = applyDirectoryRenames(newPath, successfulDirectoryRenames);
    try {
      renamePathSafely(currentSourcePath, currentTargetPath);
      successfulDirectoryRenames.push([oldPath, newPath]);
    } catch (error) {
      failedRenames.push({
        source: currentSourcePath,
        target: currentTargetPath,
        reason: getErrorMessage(error),
      });
    }
    continue;
  }

  successfulDirectoryRenames.push([oldPath, newPath]);
}

const successfulDirectoryRenamesForPathMapping = [...successfulDirectoryRenames].sort(
  ([leftSource], [rightSource]) => rightSource.length - leftSource.length,
);

const effectiveFilePathsByOriginalPath = dryRun
  ? finalFilePathsByOriginalPath
  : buildEffectiveFilePathMap(allFiles, successfulFileRenameOperations, successfulDirectoryRenamesForPathMapping);

renamedTargetSet = new Set(effectiveFilePathsByOriginalPath.values());

const newToOldMap = new Map<string, string>();
for (const [oldPath, newPath] of effectiveFilePathsByOriginalPath) {
  newToOldMap.set(newPath, oldPath);
}

const filesAfterRename = dryRun
  ? allFiles.map((file) => effectiveFilePathsByOriginalPath.get(file) ?? file)
  : walkWorkspace(REPO_ROOT).files;

let touchedFiles = 0;

for (const file of filesAfterRename) {
  if (!UPDATABLE_EXTENSIONS.has(path.extname(file))) continue;

  const oldImporterPath = newToOldMap.get(file) ?? file;
  const sourceFilePath = dryRun ? oldImporterPath : file;
  const content = fs.readFileSync(sourceFilePath, 'utf8');

  const updated = content.replace(
    /((?:from|import)\s+['"]|(?:require|import)\s*\(\s*['"])([^'"]+)(['"](?:\s*\))?)/g,
    (match, start, specifier, end) => {
      const rewritten = rewriteSpecifier(
        specifier,
        file,
        oldImporterPath,
        oldFilesSet,
        effectiveFilePathsByOriginalPath,
      );
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
  `Renamed ${successfulFileRenameOperations.size} files and ${successfulDirectoryRenames.length} directories${dryRun ? ' (dry run)' : ''} and updated imports in ${touchedFiles} files. Skipped ${skippedRenames.length} renames. Failed ${failedRenames.length} renames.`,
);

if (dryRun) {
  for (const [oldPath, newPath] of fileRenameOperations) {
    console.log(`${toRepoPath(oldPath)} -> ${toRepoPath(newPath)}`);
  }
  for (const [oldPath, newPath] of directoryRenamesForExecution) {
    console.log(`${toRepoPath(oldPath)} -> ${toRepoPath(newPath)}`);
  }
}

for (const { source, reason } of skippedRenames) {
  console.warn(`Skipped ${toRepoPath(source)}: ${reason}`);
}

for (const { source, target, reason } of failedRenames) {
  console.warn(`Failed ${toRepoPath(source)} -> ${toRepoPath(target)}: ${reason}`);
}

function walkWorkspace(rootDir: string): { files: string[]; directories: string[] } {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const files: string[] = [];
  const directories: string[] = [];

  for (const entry of entries) {
    if (entry.name === '.' || entry.name === '..') continue;
    if (entry.isDirectory() && IGNORED_DIRS.has(entry.name)) continue;

    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      directories.push(fullPath);
      const nestedWorkspace = walkWorkspace(fullPath);
      files.push(...nestedWorkspace.files);
      directories.push(...nestedWorkspace.directories);
      continue;
    }

    files.push(fullPath);
  }

  return { files, directories };
}

function toSnakeCase(name: string): string {
  if (!/[A-Z]/.test(name)) return name;

  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[\s-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
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

function isCaseOnlyPathRename(sourcePath: string, targetPath: string): boolean {
  return sourcePath.toLowerCase() === targetPath.toLowerCase() && sourcePath !== targetPath;
}

function renamePathSafely(sourcePath: string, targetPath: string): void {
  if (!isCaseOnlyPathRename(sourcePath, targetPath)) {
    fs.renameSync(sourcePath, targetPath);
    return;
  }

  const temporaryPath = `${sourcePath}.__rename_tmp__${process.pid}_${Date.now()}`;
  fs.renameSync(sourcePath, temporaryPath);
  fs.renameSync(temporaryPath, targetPath);
}

function normalizeDirectoryPath(directoryPath: string): string {
  const relativeDirectoryPath = path.relative(REPO_ROOT, directoryPath);
  if (relativeDirectoryPath === '') return directoryPath;

  const normalizedSegments = relativeDirectoryPath.split(path.sep).map(toSnakeCase);
  return path.join(REPO_ROOT, ...normalizedSegments);
}

function applyDirectoryRenames(
  valuePath: string,
  sortedDirectoryRenames: Array<[string, string]>,
): string {
  let resolvedPath = valuePath;
  let hasChanges = true;

  while (hasChanges) {
    hasChanges = false;

    for (const [sourceDirectoryPath, targetDirectoryPath] of sortedDirectoryRenames) {
      if (
        resolvedPath === sourceDirectoryPath ||
        resolvedPath.startsWith(`${sourceDirectoryPath}${path.sep}`)
      ) {
        const suffixPath = resolvedPath.slice(sourceDirectoryPath.length);
        resolvedPath = `${targetDirectoryPath}${suffixPath}`;
        hasChanges = true;
        break;
      }
    }
  }

  return resolvedPath;
}

function buildEffectiveFilePathMap(
  allOriginalFiles: string[],
  successfulFileRenames: Map<string, string>,
  successfulDirectoryRenamesForPathMapping: Array<[string, string]>,
): Map<string, string> {
  const effectiveFilePathsByOriginalPath = new Map<string, string>();

  for (const file of allOriginalFiles) {
    const pathAfterFileRename = successfulFileRenames.get(file) ?? file;
    const finalFilePath = applyDirectoryRenames(pathAfterFileRename, successfulDirectoryRenamesForPathMapping);
    if (finalFilePath !== file) {
      effectiveFilePathsByOriginalPath.set(file, finalFilePath);
    }
  }

  return effectiveFilePathsByOriginalPath;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return String(error);
}