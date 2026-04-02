import { useEffect, useState } from 'react';

// Tailwind CSS default breakpoints
const breakpoints = {
  '2xl': 1536,
  xl: 1280,
  lg: 1024,
  md: 768,
  sm: 640,
} as const;

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const getBreakpoint = (): Breakpoint => {
  if (typeof window === 'undefined') return 'xs';
  const width = window.innerWidth;
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

/**
 * Returns the current Tailwind CSS breakpoint based on window width.
 * Updates only when a breakpoint boundary is crossed (via matchMedia listeners).
 */
export default function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getBreakpoint);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const queries = (Object.entries(breakpoints) as [Breakpoint, number][]).map(([_name, minWidth]) => {
      const mediaQuery = window.matchMedia(`(min-width: ${minWidth}px)`);
      const handler = () => setBreakpoint(getBreakpoint());
      mediaQuery.addEventListener('change', handler);
      return { mediaQuery, handler };
    });

    return () => {
      queries.forEach(({ mediaQuery, handler }) => {
        mediaQuery.removeEventListener('change', handler);
      });
    };
  }, []);

  return breakpoint;
}
