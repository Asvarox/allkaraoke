export type SongQualityIssue = 'not-in-sync' | 'too-loud' | 'too-quiet';

export const SONG_QUALITY_ISSUES: SongQualityIssue[] = ['not-in-sync', 'too-loud', 'too-quiet'];

/*
 * Popular songs collect more reports just because more people play them, so a raw report count
 * flags hits and misses broken songs nobody plays. Instead, a song is flagged for an issue when the
 * share of its players reporting it is clearly above the catalog-wide share:
 *  - reporters and players are counted as distinct people, so one person spamming reports counts once
 *  - the share is the lower bound of its 95% Wilson interval, so 2 reports out of 3 plays isn't enough
 *    on its own, while 30 reports out of 200 plays is
 *  - that lower bound must be ISSUE_RATE_MULTIPLIER times the catalog-wide share for the issue
 */
export const MIN_REPORTERS = 3;
export const ISSUE_RATE_MULTIPLIER = 4;
const Z_95 = 1.96;

export const wilsonLowerBound = (successes: number, trials: number) => {
  if (trials <= 0) return 0;

  const share = successes / trials;
  const z2 = Z_95 * Z_95;
  const center = share + z2 / (2 * trials);
  const margin = Z_95 * Math.sqrt((share * (1 - share)) / trials + z2 / (4 * trials * trials));

  return (center - margin) / (1 + z2 / trials);
};

export type IssueBaselines = Record<SongQualityIssue, number>;

export interface SongIssueStats {
  reporters: number;
  players: number;
}

export interface IssueVerdict {
  flagged: boolean;
  /** Share of players who reported the issue (0-1) */
  reportRate: number;
  /** Lower bound of the 95% interval of that share (0-1) */
  reportRateLowerBound: number;
}

export const judgeSongIssue = (stats: SongIssueStats, baseline: number): IssueVerdict => {
  // A report implies the person played the song, even if the play event got lost
  const players = Math.max(stats.players, stats.reporters);
  const reportRate = players ? stats.reporters / players : 0;
  const reportRateLowerBound = wilsonLowerBound(stats.reporters, players);

  return {
    flagged: stats.reporters >= MIN_REPORTERS && reportRateLowerBound > baseline * ISSUE_RATE_MULTIPLIER,
    reportRate,
    reportRateLowerBound,
  };
};
