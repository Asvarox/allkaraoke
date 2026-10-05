import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getVerificationDay, markAdminSongVerified, useVerifiedSongsTodayCount } from './verified-songs-counter';

describe('verified songs counter', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('treats the time before 4am as the previous day', () => {
    expect(getVerificationDay(new Date(2026, 9, 5, 3, 59))).toBe('2026-10-04');
    expect(getVerificationDay(new Date(2026, 9, 5, 4, 0))).toBe('2026-10-05');
  });

  it('counts unique songs and resets at 4am', () => {
    vi.setSystemTime(new Date(2026, 9, 5, 23, 0));
    const { result, rerender } = renderHook(() => useVerifiedSongsTodayCount());

    act(() => {
      markAdminSongVerified('a');
      markAdminSongVerified('b');
      markAdminSongVerified('a');
    });
    expect(result.current).toBe(2);

    vi.setSystemTime(new Date(2026, 9, 6, 3, 59));
    rerender();
    expect(result.current).toBe(2);

    vi.setSystemTime(new Date(2026, 9, 6, 4, 0));
    rerender();
    expect(result.current).toBe(0);

    act(() => markAdminSongVerified('a'));
    expect(result.current).toBe(1);
  });
});
