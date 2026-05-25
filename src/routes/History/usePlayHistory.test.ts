import { describe, expect, it } from 'vitest';
import { groupEntriesByDay } from './usePlayHistory';

describe('groupEntriesByDay', () => {
  it('groups entries from the same calendar day under one header', () => {
    const entries = [
      { date: '2026-05-19T21:00:00.000Z', songKey: 'a', song: null, progress: 1, mode: 'DUEL', scores: [] },
      { date: '2026-05-19T20:00:00.000Z', songKey: 'b', song: null, progress: 1, mode: 'DUEL', scores: [] },
      { date: '2026-05-18T20:00:00.000Z', songKey: 'c', song: null, progress: 1, mode: 'DUEL', scores: [] },
    ] as any;

    const groups = groupEntriesByDay(entries);
    expect(groups).toHaveLength(2);
    expect(groups[0].entries).toHaveLength(2);
    expect(groups[1].entries).toHaveLength(1);
  });

  it('returns empty array for no entries', () => {
    expect(groupEntriesByDay([])).toEqual([]);
  });
});
