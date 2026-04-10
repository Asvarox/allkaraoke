import { resolveResponsiveValue, ResponsiveValue } from '~/modules/Elements/AKUI/types';
import useBreakpoint from '~/modules/hooks/useBreakpoint';

/**
 * Hook that resolves a `ResponsiveValue<T>` to a plain value for the current breakpoint.
 */
export default function useResponsiveValue<T>(value: ResponsiveValue<T>): T {
  const breakpoint = useBreakpoint();
  return resolveResponsiveValue(value, breakpoint);
}
