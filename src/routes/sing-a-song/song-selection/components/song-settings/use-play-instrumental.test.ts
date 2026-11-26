import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useInstrumentalsEnabled from '~/modules/songs/use-instrumentals-enabled';

import usePlayInstrumental, {
  setPlaylistInstrumentalDefault,
  useInstrumentalPreference,
} from './use-play-instrumental';

vi.mock('~/modules/songs/use-instrumentals-enabled', () => ({ default: vi.fn(() => true) }));

const withInstrumental = { instrumental: { video: 'abcdefghijk', gap: 0, videoGap: 0, volume: 1 } };

describe('usePlayInstrumental', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(useInstrumentalsEnabled).mockReturnValue(true);
  });
  afterEach(() => act(() => setPlaylistInstrumentalDefault(false)));

  it('follows the playlist default until the player picks', () => {
    const { result } = renderHook(() => usePlayInstrumental(withInstrumental));
    expect(result.current.playInstrumental).toBe(false);

    act(() => setPlaylistInstrumentalDefault(true));
    expect(result.current.playInstrumental).toBe(true);

    act(() => setPlaylistInstrumentalDefault(false));
    expect(result.current.playInstrumental).toBe(false);
  });

  it("keeps the player's own choice in every playlist", () => {
    const { result } = renderHook(() => usePlayInstrumental(withInstrumental));
    act(() => result.current.setPlayInstrumental(false));
    act(() => setPlaylistInstrumentalDefault(true));
    expect(result.current.playInstrumental).toBe(false);

    act(() => result.current.setPlayInstrumental(true));
    act(() => setPlaylistInstrumentalDefault(false));
    expect(result.current.playInstrumental).toBe(true);
  });

  it('is never on for a song without an instrumental', () => {
    const { result } = renderHook(() => usePlayInstrumental({}));
    act(() => setPlaylistInstrumentalDefault(true));
    expect(result.current.playInstrumental).toBe(false);
  });

  it('always plays the original while the feature flag is off, whatever the player picked', () => {
    vi.mocked(useInstrumentalsEnabled).mockReturnValue(false);
    const { result } = renderHook(() => ({
      song: usePlayInstrumental(withInstrumental),
      preference: useInstrumentalPreference(),
    }));
    act(() => result.current.song.setPlayInstrumental(true));
    act(() => setPlaylistInstrumentalDefault(true));

    expect(result.current.song).toMatchObject({ isAvailable: false, playInstrumental: false });
    expect(result.current.preference[0]).toBe(false);
  });
});
