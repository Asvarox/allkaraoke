import { judgeSongIssue, wilsonLowerBound } from './song-quality-scoring';

// Catalog-wide share of players reporting not-in-sync, measured in November 2026
const NOT_IN_SYNC_BASELINE = 0.0047;

describe('wilsonLowerBound', () => {
  it('is 0 without trials and grows towards the observed share with more trials', () => {
    expect(wilsonLowerBound(0, 0)).toBe(0);
    expect(wilsonLowerBound(1, 10)).toBeLessThan(wilsonLowerBound(10, 100));
    expect(wilsonLowerBound(100, 1000)).toBeCloseTo(0.083, 2);
  });
});

describe('judgeSongIssue', () => {
  it('does not flag a popular song whose report count is high but in line with the catalog', () => {
    // e.g. a hit with 17 reports out of 2300 players
    expect(judgeSongIssue({ reporters: 17, players: 2300 }, NOT_IN_SYNC_BASELINE).flagged).toBe(false);
  });

  it('flags a song where a large share of its players report the issue', () => {
    expect(judgeSongIssue({ reporters: 35, players: 235 }, NOT_IN_SYNC_BASELINE).flagged).toBe(true);
    expect(judgeSongIssue({ reporters: 6, players: 14 }, NOT_IN_SYNC_BASELINE).flagged).toBe(true);
  });

  it('needs at least 3 distinct reporters', () => {
    expect(judgeSongIssue({ reporters: 2, players: 2 }, NOT_IN_SYNC_BASELINE).flagged).toBe(false);
  });

  it('counts reporters as players when play events are missing', () => {
    const verdict = judgeSongIssue({ reporters: 4, players: 0 }, NOT_IN_SYNC_BASELINE);

    expect(verdict.reportRate).toBe(1);
    expect(verdict.flagged).toBe(true);
  });
});
