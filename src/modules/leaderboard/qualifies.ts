import { MAX_QUALIFYING_TOLERANCE, QUALIFYING_SCORE } from '~/modules/leaderboard/consts';
import isE2E from '~/modules/utils/is-e2-e';

/**
 * The threshold is scaled down under e2e exactly the way `use-high-scores.ts` scales its seeded
 * scores, so the e2e run exercises the real qualifying branch instead of a stubbed one. What keeps
 * the prompt out of the other specs is the feature flag (see `use-leaderboard-enabled.ts`).
 */
export const getQualifyingScore = () => (isE2E() ? QUALIFYING_SCORE / 1000 : QUALIFYING_SCORE);

/**
 * Difficulty is part of qualifying, not just the score: Easy (and the debug widths above it) widen
 * the pitch window enough that its scores are not comparable, so nothing sung on them is offered to
 * the board. The Worker enforces the same rule on submit — this only keeps the prompt away.
 */
export const qualifiesForLeaderboard = (score: number, tolerance: number) =>
  score >= getQualifyingScore() && tolerance <= MAX_QUALIFYING_TOLERANCE;
