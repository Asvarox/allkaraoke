import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../src');

// Extensions to check for imports
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts'];

// Find all TypeScript/JavaScript files in src/
function findSourceFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findSourceFiles(fullPath));
    } else if (EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

// Check if a path resolves to a valid file within src/
function isValidImport(importPath: string, fromFile: string): boolean {
  const basePath = path.join(SRC_DIR, importPath);

  // Check direct file with various extensions
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(basePath + ext)) {
      return true;
    }
  }

  // Check if it's a directory with an index file
  if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
    for (const ext of EXTENSIONS) {
      if (fs.existsSync(path.join(basePath, `index${ext}`))) {
        return true;
      }
    }
  }

  return false;
}

// Process a single file
function processFile(filePath: string): number {
  const content = fs.readFileSync(filePath, 'utf-8');
  let modified = content;
  let changeCount = 0;

  // Regex to match import statements
  // Matches: import ... from 'path' or import ... from "path"
  // Also matches: export ... from 'path'
  const importRegex = /\b(import|export)\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?(['"])([^'"]+)\2/g;

  modified = content.replace(importRegex, (match, keyword, quote, importPath) => {
    // Check if path is absolute (starts with letter, not relative . or /, not scoped package @)
    if (/^[a-zA-Z]/.test(importPath) && !importPath.startsWith('~')) {
      // Check if it's a valid import from within src/
      if (isValidImport(importPath, filePath)) {
        changeCount++;
        return `${keyword} ${match.substring(keyword.length + 1, match.lastIndexOf(quote))}${quote}~/${importPath}${quote}`;
      }
    }
    return match;
  });

  if (changeCount > 0) {
    fs.writeFileSync(filePath, modified, 'utf-8');
    console.log(`✓ ${path.relative(SRC_DIR, filePath)}: ${changeCount} import(s) fixed`);
  }

  return changeCount;
}

// Main execution
function main() {
  console.log('Finding source files...');
  const sourceFiles = findSourceFiles(SRC_DIR);
  console.log(`Found ${sourceFiles.length} source files\n`);

  let totalChanges = 0;
  let filesChanged = 0;

  for (const file of sourceFiles) {
    const changes = processFile(file);
    if (changes > 0) {
      totalChanges += changes;
      filesChanged++;
    }
  }

  console.log(`\n✨ Done! Fixed ${totalChanges} import(s) in ${filesChanged} file(s)`);
}

main();
