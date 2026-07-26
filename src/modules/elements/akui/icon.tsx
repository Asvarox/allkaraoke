import { Icon as IconifyIcon } from '@iconify-icon/react';
import { ComponentProps } from 'react';

import useResponsiveValue from './hooks/use-responsive-value';
import { ResponsiveValue } from './types';

/**
 * The only place in the app allowed to import `@iconify-icon/react` directly, so the rest of the
 * app depends on this wrapper instead of a specific icon library.
 */
export type IconProps = Omit<ComponentProps<typeof IconifyIcon>, 'size'> & {
  /**
   * Convenience for common sizes, same as Tailwind's /`w-*`/`h-*` utilities
   */
  size?: ResponsiveValue<number>;
};

export function Icon({ size, width, height, ...props }: IconProps) {
  const responsiveSize = useResponsiveValue(size);
  const resolvedSize = responsiveSize !== undefined ? responsiveSize * 4 : undefined;

  return <IconifyIcon size={resolvedSize} width={width ?? resolvedSize} height={height ?? resolvedSize} {...props} />;
}
