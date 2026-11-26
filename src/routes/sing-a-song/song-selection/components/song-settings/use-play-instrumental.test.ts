import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import usePlayInstrumental, { setPlaylistInstrumentalDefault } from './use-play-instrumental';

const withInstrumental = { instrumental: { video: 'abcdefghijk', gap: 0, videoGap: 0, volume: 1 } };

describe('usePlayInstrumental', () => {
  beforeEach(() => localStorage.clear());
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
});
