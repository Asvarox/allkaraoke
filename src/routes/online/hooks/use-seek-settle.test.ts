import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ONLINE_SEEK_SETTLE_MS } from '~/modules/online/protocol/consts';
import { useSeekSettle } from '~/routes/online/hooks/use-seek-settle';

let buffering: boolean;
const report = vi.fn();

const setup = () => renderHook(() => useSeekSettle(report, () => buffering));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(100_000);
  buffering = false;
  report.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useSeekSettle', () => {
  it('reports buffering at once when the client has not seeked', () => {
    const { result } = setup();

    result.current.reportStatus('buffering');

    expect(report).toHaveBeenCalledWith('buffering');
  });

  it('holds back buffering caused by a seek that recovers within the settle window', () => {
    const { result } = setup();
    result.current.markSeek();

    buffering = true;
    result.current.reportStatus('buffering');
    vi.advanceTimersByTime(1_000);
    buffering = false;
    result.current.reportStatus('playing');
    vi.advanceTimersByTime(ONLINE_SEEK_SETTLE_MS);

    expect(report.mock.calls).toEqual([['playing']]);
  });

  it('reports buffering after a seek once it outlasts the settle window', () => {
    const { result } = setup();
    result.current.markSeek();
    vi.advanceTimersByTime(1_000);

    buffering = true;
    result.current.reportStatus('buffering');
    vi.advanceTimersByTime(ONLINE_SEEK_SETTLE_MS - 1_000 - 1);
    expect(report).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(report).toHaveBeenCalledWith('buffering');
  });

  it('is settling only within the window after a seek', () => {
    const { result } = setup();
    expect(result.current.isSettling()).toBe(false);

    result.current.markSeek();
    expect(result.current.isSettling()).toBe(true);

    vi.advanceTimersByTime(ONLINE_SEEK_SETTLE_MS);
    expect(result.current.isSettling()).toBe(false);
  });

  it('keeps its identity across renders, so the playback effects depending on it do not restart', () => {
    const { result, rerender } = setup();
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });

  it('drops a pending buffering report on unmount', () => {
    const { result, unmount } = setup();
    result.current.markSeek();
    buffering = true;
    result.current.reportStatus('buffering');

    unmount();
    vi.advanceTimersByTime(ONLINE_SEEK_SETTLE_MS);

    expect(report).not.toHaveBeenCalled();
  });
});
