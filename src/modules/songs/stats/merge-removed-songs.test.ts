import { GAME_MODE, SingSetup } from '~/interfaces';
import { SongStats } from '~/modules/songs/stats/common';
import { mergeRemovedSongStats } from '~/modules/songs/stats/merge-removed-songs';
import { resolveMergeTarget } from '~/modules/songs/utils/removed-songs';

const setup: SingSetup = { id: 'sing-1', players: [{ number: 0, track: 0 }], mode: GAME_MODE.DUEL, tolerance: 2 };

const run = (date: string, score: number) => ({ setup, scores: [{ name: 'Ann', score }], date });

describe('resolveMergeTarget', () => {
  it('follows merge chains to the song still in the library', () => {
    expect(resolveMergeTarget({ a: 'b', b: 'c' }, 'a')).toBe('c');
  });

  it('returns null when the chain ends in a removal or loops', () => {
    expect(resolveMergeTarget({ a: 'b', b: null }, 'a')).toBeNull();
    expect(resolveMergeTarget({ a: null }, 'a')).toBeNull();
    expect(resolveMergeTarget({ a: 'b', b: 'a' }, 'a')).toBe('a');
  });
});

describe('mergeRemovedSongStats', () => {
  it('moves the history of merged songs onto their parent, in date order', () => {
    const stats: Record<string, SongStats> = {
      parent: { plays: 1, scores: [run('2026-02-01', 100)] },
      dupe: { plays: 2, scores: [run('2026-01-01', 50), run('2026-03-01', 70)] },
      other: { plays: 1, scores: [run('2026-01-05', 10)] },
    };

    const { updated, removedKeys } = mergeRemovedSongStats(stats, { dupe: 'parent' });

    expect(removedKeys).toEqual(['dupe']);
    expect(updated).toEqual({
      parent: { plays: 3, scores: [run('2026-01-01', 50), run('2026-02-01', 100), run('2026-03-01', 70)] },
    });
  });

  it('merges several duplicates into one parent, even when the parent has no history', () => {
    const stats: Record<string, SongStats> = {
      a: { plays: 1, scores: [run('2026-01-01', 1)] },
      b: { plays: 1, scores: [run('2026-01-02', 2)] },
    };

    const { updated } = mergeRemovedSongStats(stats, { a: 'parent', b: 'parent' });

    expect(updated.parent).toEqual({ plays: 2, scores: [run('2026-01-01', 1), run('2026-01-02', 2)] });
  });

  it('does not duplicate runs already moved by an interrupted merge', () => {
    const stats: Record<string, SongStats> = {
      parent: { plays: 2, scores: [run('2026-01-01', 50), run('2026-02-01', 100)] },
      dupe: { plays: 1, scores: [run('2026-01-01', 50)] },
    };

    expect(mergeRemovedSongStats(stats, { dupe: 'parent' }).updated.parent).toEqual(stats.parent);
  });

  it('keeps the history of songs removed without a merge', () => {
    const stats: Record<string, SongStats> = { gone: { plays: 1, scores: [run('2026-01-01', 1)] } };

    expect(mergeRemovedSongStats(stats, { gone: null })).toEqual({ updated: {}, removedKeys: [] });
  });
});
