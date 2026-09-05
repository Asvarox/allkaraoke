import { MAX_GLOBAL_BOARD_TOLERANCE, MAX_SUBMITTED_TOLERANCE, QUALIFYING_SCORE } from '~/modules/leaderboard/consts';
import isE2E from '~/modules/utils/is-e2-e';

/**
 * The threshold is scaled down under e2e exactly the way `use-high-scores.ts` scales its seeded
 * scores, so the e2e run exercises the real qualifying branch instead of a stubbed one.
 */
export const getQualifyingScore = () => (isE2E() ? QUALIFYING_SCORE / 1000 : QUALIFYING_SCORE);

/**
 * Whether the difficulty has a board to reach, and so whether the score is worth offering to share.
 *
 * Every shipped difficulty has one — Easy is ranked against other Easy runs of the same song rather
 * than against Medium and Hard — but the dev-only debug widths above Easy do not: a score collected
 * then would sit in storage with nothing to show it on.
 */
export const hasLeaderboard = (tolerance: number) => tolerance <= MAX_SUBMITTED_TOLERANCE;

/**
 * Whether a score also reaches the single global board on the main menu, which mixes every song and
 * difficulty into one ranking. Easy widens the pitch window enough that its scores would not be
 * comparable there. The Worker's projection enforces the same rule — this only shapes what the
 * post-game screen tells the player.
 */
export const reachesGlobalBoard = (tolerance: number) => tolerance <= MAX_GLOBAL_BOARD_TOLERANCE;

/** Whether the score is worth offering to share — high enough, on a difficulty that has a board. */
export const qualifiesForLeaderboard = (score: number, tolerance: number) =>
  score >= getQualifyingScore() && hasLeaderboard(tolerance);
