import { FeatureFlags } from '~/modules/utils/feature-flags';
import isE2E from '~/modules/utils/is-e2-e';
import useFeatureFlag from '~/modules/utils/use-feature-flag';

/**
 * Whether the global leaderboard is on.
 *
 * `useFeatureFlag` forces every flag on under e2e, which would put the board and the post-game
 * prompt into every existing spec (and every main-menu screenshot). So under e2e this flag is
 * driven by an opt-in set from the test instead, which also gives the spec a genuine off-state to
 * assert against.
 */
export default function useLeaderboardEnabled(): boolean {
  const flagEnabled = useFeatureFlag(FeatureFlags.Leaderboard);

  if (isE2E()) return !!globalThis.isE2ELeaderboard;

  return !!flagEnabled;
}
