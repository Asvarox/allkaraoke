import { iconLoaded } from '@iconify-icon/react';

import './icon';
import { ICON_NAMES } from './icon-names';

describe('Icon', () => {
  it('bundles every icon in ICON_NAMES - run `pnpm icons:generate` after changing them', () => {
    expect(ICON_NAMES.filter((name) => !iconLoaded(name))).toEqual([]);
  });
});
