import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsUserActive } from '~/modules/online/client/hooks';
import { ONLINE_IDLE_AFTER_MS } from '~/modules/online/protocol/consts';

/** happy-dom derives `document.hidden` from its own visibility state, so it gets stubbed outright. */
const setHidden = (hidden: boolean) => {
  Object.defineProperty(document, 'hidden', { value: hidden, configurable: true });
};

describe('useIsUserActive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setHidden(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts inactive when the room is mounted in a hidden tab', () => {
    // No `visibilitychange` is coming — the tab was already hidden — so starting out active would
    // have the singer report for a full idle window before anything noticed.
    setHidden(true);
    const { result } = renderHook(() => useIsUserActive(true));
    expect(result.current).toBe(false);
  });

  it('starts active in a visible tab and goes idle after the window elapses', () => {
    const { result } = renderHook(() => useIsUserActive(true));
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(ONLINE_IDLE_AFTER_MS);
    });
    expect(result.current).toBe(false);

    act(() => {
      global.dispatchEvent(new Event('keydown'));
    });
    expect(result.current).toBe(true);
  });

  it('follows the tab being hidden and shown again', () => {
    const { result } = renderHook(() => useIsUserActive(true));

    act(() => {
      setHidden(true);
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current).toBe(false);

    act(() => {
      setHidden(false);
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current).toBe(true);
  });

  it('never idles while disabled, hidden tab or not', () => {
    setHidden(true);
    const { result } = renderHook(() => useIsUserActive(false));
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(ONLINE_IDLE_AFTER_MS * 2);
    });
    expect(result.current).toBe(true);
  });
});
