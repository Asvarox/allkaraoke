// Generates a real declaration tree for the akui barrel (.design-sync/entry.tsx)
// so design-sync's exportedNames() scan sees real component exports + props.
// Run via `node .design-sync/gen-dts.mjs` (this repo has no library build/dist
// for akui — see .design-sync/NOTES.md).
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, 'dts-out');

rmSync(outDir, { recursive: true, force: true });
try {
  execSync(`npx tsc -p ${join(here, 'tsconfig.dts.json')}`, { stdio: 'inherit' });
} catch {
  // tsc exits non-zero on type errors in unrelated files it pulls in
  // transitively; declarations still emit (noEmitOnError defaults to false).
}

const nestedEntry = join(outDir, '.design-sync', 'entry.d.ts');
if (!existsSync(nestedEntry)) {
  console.error('[gen-dts] entry.d.ts was not emitted — tsc failed before writing output');
  process.exit(1);
}

// Flatten .design-sync/dts-out/.design-sync/entry.d.ts → .design-sync/dts-out/entry.d.ts
// and rewrite '~/...' alias specifiers to paths relative to the flattened
// location, so the plain ts-morph Project design-sync uses (no `paths` of its
// own) can resolve the re-exports against the sibling src/ declarations.
let text = readFileSync(nestedEntry, 'utf8');
text = text.replace(/(['"])~\/(.*?)\1/g, (_m, q, p) => `${q}./src/${p}${q}`);
writeFileSync(join(outDir, 'entry.d.ts'), text);
rmSync(join(outDir, '.design-sync'), { recursive: true, force: true });

mkdirSync(here, { recursive: true });
console.log(`[gen-dts] wrote ${join(outDir, 'entry.d.ts')}`);
