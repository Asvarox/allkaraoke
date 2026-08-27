import { QUALIFYING_SCORE } from '~/modules/leaderboard/consts';
import isE2E from '~/modules/utils/is-e2-e';

/**
 * The threshold is scaled down under e2e exactly the way `use-high-scores.ts` scales its seeded
 * scores, so the e2e run exercises the real qualifying branch instead of a stubbed one. What keeps
 * the prompt out of the other specs is the feature flag (see `use-leaderboard-enabled.ts`).
 */
export const getQualifyingScore = () => (isE2E() ? QUALIFYING_SCORE / 1000 : QUALIFYING_SCORE);

export const qualifiesForLeaderboard = (score: number) => score >= getQualifyingScore();
