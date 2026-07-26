import { Icon as IconifyIcon } from '@iconify-icon/react';
import { ComponentProps } from 'react';

import useResponsiveValue from './hooks/use-responsive-value';
import { ResponsiveValue } from './types';

/**
 * Every iconify identifier actually used in the app. Kept as a closed union (rather than plain
 * `string`) so a new icon can't be introduced by copy-pasting a slightly different identifier for a
 * role that's already covered by one of these — adding one here is a deliberate, greppable step.
 */
export type IconName =
  | 'cib:facebook'
  | 'cib:github'
  | 'cib:instagram'
  | 'ic:baseline-access-time'
  | 'ic:baseline-add'
  | 'ic:baseline-arrow-back'
  | 'ic:baseline-arrow-forward'
  | 'ic:baseline-arrow-right'
  | 'ic:baseline-casino'
  | 'ic:baseline-check'
  | 'ic:baseline-check-box'
  | 'ic:baseline-check-box-outline-blank'
  | 'ic:baseline-close'
  | 'ic:baseline-delete'
  | 'ic:baseline-download'
  | 'ic:baseline-edit'
  | 'ic:baseline-error'
  | 'ic:baseline-expand-more'
  | 'ic:baseline-fast-forward'
  | 'ic:baseline-favorite'
  | 'ic:baseline-fullscreen'
  | 'ic:baseline-fullscreen-exit'
  | 'ic:baseline-games'
  | 'ic:baseline-help'
  | 'ic:baseline-keyboard'
  | 'ic:baseline-keyboard-arrow-down'
  | 'ic:baseline-keyboard-arrow-left'
  | 'ic:baseline-keyboard-arrow-right'
  | 'ic:baseline-keyboard-arrow-up'
  | 'ic:baseline-laptop'
  | 'ic:baseline-list'
  | 'ic:baseline-lock-open'
  | 'ic:baseline-logout'
  | 'ic:baseline-pause'
  | 'ic:baseline-people-alt'
  | 'ic:baseline-person'
  | 'ic:baseline-phone-android'
  | 'ic:baseline-phone-iphone'
  | 'ic:baseline-photo-camera'
  | 'ic:baseline-play-arrow'
  | 'ic:baseline-qr-code'
  | 'ic:baseline-qr-code-2'
  | 'ic:baseline-refresh'
  | 'ic:baseline-remove'
  | 'ic:baseline-search'
  | 'ic:baseline-settings'
  | 'ic:baseline-shuffle'
  | 'ic:baseline-star'
  | 'ic:baseline-swap-horiz'
  | 'ic:baseline-sync'
  | 'ic:baseline-visibility'
  | 'ic:baseline-visibility-off'
  | 'ic:baseline-warning'
  | 'ic:baseline-wifi'
  | 'ic:outline-check-circle'
  | 'ic:outline-fiber-new'
  | 'ic:outline-help'
  | 'ic:outline-lock'
  | 'ic:round-people-alt'
  | 'mdi:arrow-left'
  | 'mdi:circle'
  | 'mdi:qrcode-scan'
  | 'mdi:warning'
  | 'mdi:wifi';

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

  return <IconifyIcon size={resolvedSize} width={width ?? resolvedSize} height={height ?? resolvedSize} {...props} />;
}
