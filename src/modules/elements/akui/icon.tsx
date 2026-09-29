import { addCollection, Icon as IconifyIcon } from '@iconify-icon/react';
import { ComponentProps } from 'react';
import iconCollections from 'virtual:icon-collections';

import useResponsiveValue from './hooks/use-responsive-value';
import { IconName } from './icon-names';
import { ResponsiveValue } from './types';

export type { IconName } from './icon-names';

// Bundled rather than fetched from the Iconify API on first render, so icons show up at once and offline
iconCollections.forEach((collection) => addCollection(collection));

/**
 * The only place in the app allowed to import `@iconify-icon/react` directly, so the rest of the
 * app depends on this wrapper instead of a specific icon library.
 */
export type IconProps = Omit<ComponentProps<typeof IconifyIcon>, 'size' | 'icon'> & {
  icon: IconName;
  /**
   * Convenience for common sizes, same as Tailwind's /`w-*`/`h-*` utilities
   */
  size?: ResponsiveValue<number>;
};

export function Icon({ size, width, height, ...props }: IconProps) {
  const responsiveSize = useResponsiveValue(size);
  const resolvedSize = responsiveSize !== undefined ? responsiveSize * 4 : undefined;

  return (
    <IconifyIcon
      // Draws the icon even off screen - it's bundled, so there's nothing left to save by waiting until it's
      // scrolled into view, and full-page screenshots would otherwise capture it missing
      noobserver
      size={resolvedSize}
      width={width ?? resolvedSize}
      height={height ?? resolvedSize}
      {...props}
    />
  );
}
