import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsUserActive } from '~/modules/online/client/hooks';
import { ONLINE_IDLE_AFTER_MS } from '~/modules/online/protocol/consts';

/** happy-dom derives `document.hidden` from its own visibility state, so it gets stubbed outright.
 * Captured once, at import time: `setHidden` runs several times per test, so a lazy capture would
 * take the previous stub for the original on the second call. */
const originalHidden = Object.getOwnPropertyDescriptor(document, 'hidden');

const setHidden = (hidden: boolean) => {
  Object.defineProperty(document, 'hidden', { value: hidden, configurable: true });
};

/** Puts the real accessor back, so the stub can't shadow it for anything added to this file later.
 * happy-dom defines `hidden` on the prototype rather than on the document, so there is usually no
 * own descriptor to restore — the stub is simply removed. */
const restoreHidden = () => {
  if (originalHidden) {
    Object.defineProperty(document, 'hidden', originalHidden);
  } else {
    delete (document as { hidden?: boolean }).hidden;
  }
};

describe('useIsUserActive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setHidden(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    restoreHidden();
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
