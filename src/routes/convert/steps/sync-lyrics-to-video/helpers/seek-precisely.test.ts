import { describe, expect, it, vi } from 'vitest';

import { PlayerRef } from '~/routes/game/singing/player';

import seekPrecisely from './seek-precisely';

vi.mock('~/modules/utils/sleep', () => ({ default: () => Promise.resolve() }));

// Simulates YouTube: an unbuffered seek lands on an earlier keyframe, a buffered one is exact
const createPlayer = (keyframeOffset: number) => {
  let time = 0;
  let buffered = false;
  const seekTo = vi.fn((target: number) => {
    time = buffered ? target : target - keyframeOffset;
  });
  const player = {
    seekTo,
    play: vi.fn(),
    pause: vi.fn(),
    setPlaybackSpeed: vi.fn(),
    getDuration: () => 0,
    getCurrentTime: async () => {
      const current = time;
      time += 0.1;
      buffered = true;
      return current * 1000;
    },
  } satisfies PlayerRef;

  return { player, seekTo };
};

describe('seekPrecisely', () => {
  it('re-seeks when the player lands on an earlier keyframe', async () => {
    const { player, seekTo } = createPlayer(1.5);

    await seekPrecisely(player, 30, () => false);

    expect(seekTo).toHaveBeenCalledTimes(2);
    expect(seekTo).toHaveBeenLastCalledWith(30);
    expect(await player.getCurrentTime()).toBeGreaterThanOrEqual(29.8 * 1000);
  });

  it('seeks once when the player lands on target', async () => {
    const { player, seekTo } = createPlayer(0);

    await seekPrecisely(player, 30, () => false);

    expect(seekTo).toHaveBeenCalledTimes(1);
  });

  it('stops when a newer seek supersedes it', async () => {
    const { player, seekTo } = createPlayer(1.5);

    await seekPrecisely(player, 30, () => true);

    expect(seekTo).toHaveBeenCalledTimes(1);
  });
});
