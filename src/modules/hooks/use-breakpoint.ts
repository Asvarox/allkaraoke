import { useSyncExternalStore } from 'react';

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

// Singleton store — media query listeners are registered once for the whole app,
// regardless of how many components call useBreakpoint().
let currentBreakpoint: Breakpoint = getBreakpoint();
const subscribers = new Set<() => void>();

const notifySubscribers = () => {
  const next = getBreakpoint();
  if (next !== currentBreakpoint) {
    currentBreakpoint = next;
    subscribers.forEach((callback) => callback());
  }
};

if (typeof window !== 'undefined') {
  (Object.values(breakpoints) as number[]).forEach((minWidth) => {
    window.matchMedia(`(min-width: ${minWidth}px)`).addEventListener('change', notifySubscribers);
  });
}

const subscribe = (callback: () => void) => {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
};

const getSnapshot = () => currentBreakpoint;

/**
 * Returns the current Tailwind CSS breakpoint based on window width.
 * Updates only when a breakpoint boundary is crossed (via matchMedia listeners).
 * Uses a module-level singleton so listeners are registered only once regardless
 * of how many components call this hook.
 */
export default function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, getSnapshot, getBreakpoint);
}
