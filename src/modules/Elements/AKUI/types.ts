export type PolymorphicProps<E extends React.ElementType> = React.PropsWithChildren<
  React.ComponentPropsWithoutRef<E> & {
    as?: E;
  }
>;

import { Breakpoint } from '~/modules/hooks/use-breakpoint';

/**
 * A value that can either be a plain value or a breakpoint-keyed object.
 * When an object is provided, the value is resolved based on the current
 * screen breakpoint, falling back to narrower breakpoints as needed.
 *
 * Example: `{ xs: 'mini', sm: 'small' }` — `mini` on xs, `small` on sm and above.
 */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

/**
 * Resolves a `ResponsiveValue<T>` to a plain value given the current breakpoint.
 * If the value is not a breakpoint object, it is returned as-is.
 * Otherwise the current breakpoint is checked first, then narrower breakpoints
 * in descending order until a defined value is found.
 */
export function resolveResponsiveValue<T>(value: ResponsiveValue<T>, currentBreakpoint: Breakpoint): T {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return value as T;
  }
  const breakpointMap = value as Partial<Record<Breakpoint, T>>;
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  // Try current breakpoint first, then walk down to smaller breakpoints
  for (let index = currentIndex; index >= 0; index--) {
    const candidate = breakpointMap[breakpointOrder[index]];
    if (candidate !== undefined) return candidate;
  }
  // Walk up to larger breakpoints as a last resort
  for (let index = currentIndex + 1; index < breakpointOrder.length; index++) {
    const candidate = breakpointMap[breakpointOrder[index]];
    if (candidate !== undefined) return candidate;
  }
  // This should never happen if the object has at least one key, but TypeScript requires a return
  throw new Error('ResponsiveValue object must have at least one breakpoint key');
}
