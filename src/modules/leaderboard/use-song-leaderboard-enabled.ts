import useLeaderboardEnabled from '~/modules/leaderboard/use-leaderboard-enabled';
import { FeatureFlags } from '~/modules/utils/feature-flags';
import isE2E from '~/modules/utils/is-e2-e';
import useFeatureFlag from '~/modules/utils/use-feature-flag';

/**
 * Whether the per-song boards on the post-game screen are on.
 *
 * A second flag on top of {@link useLeaderboardEnabled} rather than a widening of it, because the
 * two ship separately: the global board is already live, and the per-song boards bring a visible
 * change to a screen every player sees plus a difficulty rule of their own (Easy is offered only
 * when they are on — it has nowhere else to go).
 *
 * Nested under the leaderboard flag: there is no per-song board to show when the feature it belongs
 * to is off, and no identity prompt to collect a name through.
 *
 * The e2e opt-in mirrors `use-leaderboard-enabled.ts` — see the reasoning there.
 */
export default function useSongLeaderboardEnabled(): boolean {
  const leaderboardEnabled = useLeaderboardEnabled();
  const flagEnabled = useFeatureFlag(FeatureFlags.SongLeaderboard);

  if (!leaderboardEnabled) return false;

  if (isE2E()) return !!globalThis.isE2ESongLeaderboard;

  return !!flagEnabled;
}
