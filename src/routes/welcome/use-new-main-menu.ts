import { useFeatureFlagVariantKey } from 'posthog-js/react';

import { FeatureFlags } from '~/modules/utils/feature-flags';
import isDev from '~/modules/utils/is-dev';
import isE2E from '~/modules/utils/is-e2-e';

/**
 * Which main menu to render — the tiled one (`test`) or the classic button column (`control`).
 *
 * An experiment rather than a plain flag, so `control` is what an unevaluated or failed lookup
 * gives: whoever we can't place in the experiment keeps the menu they already know.
 *
 * Under e2e it's driven by an opt-in the spec sets instead (`enableNewMainMenu` in tests/helpers.ts),
 * the same way the leaderboard flag is: forcing it on would rewrite the menu under every existing
 * spec and every main-menu screenshot, and the control layout needs its own coverage either way.
 */
export default function useNewMainMenu(): boolean {
  const variant = useFeatureFlagVariantKey(FeatureFlags.NewMainMenu);

  if (isE2E()) return !!globalThis.isE2ENewMainMenu;
  // Local development follows the new menu, matching how `useFeatureFlag` treats every other flag
  if (isDev()) return true;

  return variant === 'test';
}
