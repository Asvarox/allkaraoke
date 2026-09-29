import { writeFileSync } from 'node:fs';

import { icons as cib } from '@iconify-json/cib';
import { icons as ic } from '@iconify-json/ic';
import { icons as mdi } from '@iconify-json/mdi';
import { getIcons } from '@iconify/utils';

import { ICON_NAMES } from '../src/modules/elements/akui/icon-names';

/**
 * Writes the data of every icon in `ICON_NAMES` to icon-collections.json, which the app registers
 * on start instead of fetching icons from the Iconify API. Run with `pnpm icons:generate`.
 */

const OUTPUT_PATH = 'src/modules/elements/akui/icon-collections.json';

const ICON_SETS = { cib, ic, mdi };

const namesByPrefix = new Map<string, string[]>();
for (const iconName of ICON_NAMES) {
  const [prefix, name] = iconName.split(':');
  namesByPrefix.set(prefix, [...(namesByPrefix.get(prefix) ?? []), name]);
}

const collections = [...namesByPrefix].map(([prefix, names]) => {
  if (!(prefix in ICON_SETS)) {
    throw new Error(`No icon set for "${prefix}" - add @iconify-json/${prefix} and list it in ICON_SETS`);
  }
  const collection = getIcons(ICON_SETS[prefix as keyof typeof ICON_SETS], names, true);
  if (!collection || collection.not_found?.length) {
    throw new Error(`Icons not found in "${prefix}": ${collection?.not_found?.join(', ') ?? names.join(', ')}`);
  }
  // Only the icons themselves - the set's metadata isn't needed to render them
  return {
    prefix,
    icons: collection.icons,
    aliases: collection.aliases,
    width: collection.width,
    height: collection.height,
  };
});

// Keyed by prefix, so TypeScript types each set on its own rather than as one merged array element type
writeFileSync(
  OUTPUT_PATH,
  `${JSON.stringify(Object.fromEntries(collections.map((set) => [set.prefix, set])), null, 2)}\n`,
);
console.log(`Wrote ${ICON_NAMES.length} icons from ${collections.length} sets to ${OUTPUT_PATH}`);
