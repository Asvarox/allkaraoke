import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { getIcons } from '@iconify/utils';
import type { Plugin } from 'vite';

type IconSet = Parameters<typeof getIcons>[0];

const VIRTUAL_ID = 'virtual:icon-collections';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

/** The identifiers listed in `ICON_NAMES`, read from the source so an edit is picked up without a restart. */
function readIconNames(namesFile: string): string[] {
  const list = /ICON_NAMES\s*=\s*\[([\s\S]*?)\]/.exec(readFileSync(namesFile, 'utf8'))?.[1];
  if (!list) throw new Error(`No \`ICON_NAMES = [...]\` list found in ${namesFile}`);

  return [...list.matchAll(/'([^']+)'/g)].map(([, name]) => name);
}

/**
 * Serves `virtual:icon-collections`: the data of every icon in `ICON_NAMES` (in `namesFile`), taken
 * from the installed `@iconify-json/<prefix>` sets. The app registers it on start, so no icon is ever
 * fetched from the Iconify API - and adding a name to the list is all it takes to add an icon.
 */
export function bundledIcons({ namesFile }: { namesFile: string }): Plugin {
  const require = createRequire(import.meta.url);
  const iconSets = new Map<string, IconSet>();

  const loadIconSet = (prefix: string): IconSet => {
    let iconSet = iconSets.get(prefix);
    if (!iconSet) {
      let file: string;
      try {
        file = require.resolve(`@iconify-json/${prefix}/icons.json`);
      } catch {
        throw new Error(`Icon set "${prefix}" isn't installed - add @iconify-json/${prefix} as a dev dependency`);
      }
      iconSet = JSON.parse(readFileSync(file, 'utf8')) as IconSet;
      iconSets.set(prefix, iconSet);
    }
    return iconSet;
  };

  const buildCollections = () => {
    const namesByPrefix = new Map<string, string[]>();
    for (const iconName of readIconNames(namesFile)) {
      const [prefix, name] = iconName.split(':');
      namesByPrefix.set(prefix, [...(namesByPrefix.get(prefix) ?? []), name]);
    }

    return [...namesByPrefix].map(([prefix, names]) => {
      const collection = getIcons(loadIconSet(prefix), names, true);
      if (!collection || collection.not_found?.length) {
        throw new Error(`Icons not found in "${prefix}": ${(collection?.not_found ?? names).join(', ')}`);
      }
      // Only what rendering needs - the set's metadata would be dead weight in the bundle
      const { icons, aliases, width, height } = collection;
      return { prefix, icons, aliases, width, height };
    });
  };

  return {
    name: 'bundled-icons',
    resolveId: (id) => (id === VIRTUAL_ID ? RESOLVED_ID : undefined),
    load(id) {
      if (id !== RESOLVED_ID) return;
      this.addWatchFile(namesFile);
      return `export default ${JSON.stringify(buildCollections())};`;
    },
    // In dev, rebuilds the collections along with the list's own update when the list changes
    hotUpdate({ file, modules }) {
      if (file !== namesFile) return;
      const collections = this.environment.moduleGraph.getModuleById(RESOLVED_ID);
      if (!collections) return;
      this.environment.moduleGraph.invalidateModule(collections);
      return [...modules, collections];
    },
  };
}
