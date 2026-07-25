import { Icon as IconifyIcon } from '@iconify-icon/react';
import { ComponentProps } from 'react';

/**
 * The only place in the app allowed to import `@iconify-icon/react` directly, so the rest of the
 * app depends on this wrapper instead of a specific icon library.
 */
export type IconProps = ComponentProps<typeof IconifyIcon> & {
  /**
   * Convenience for common sizes, on the same 4px-per-unit scale as Tailwind's `size-*`/`w-*`/`h-*`
   * utilities (`size={5}` → 20px). Sets `width`/`height` directly rather than through CSS classes —
   * the underlying `<iconify-icon>` element computes its own render size from those attributes
   * (or `font-size` when neither is set) and doesn't reliably respond to Tailwind's `h-*`/`w-*`/
   * `size-*` classes.
   */
  size?: number;
};

export function Icon({ size, width, height, ...props }: IconProps) {
  const resolvedSize = size !== undefined ? size * 4 : undefined;
  return <IconifyIcon width={width ?? resolvedSize} height={height ?? resolvedSize} {...props} />;
}
