import { useFeatureFlagVariantKey } from 'posthog-js/react';

import { FeatureFlags } from '~/modules/utils/feature-flags';
import isDev from '~/modules/utils/is-dev';
import isE2E from '~/modules/utils/is-e2-e';

/**
 * The `song_preview_redesign` experiment: the opened song preview with the song's leaderboard beside
 * it, against the one before it.
 *
 * - `control` - the previous preview, kept in the `legacy` files
 * - `test` - the redesign
 *
 * Whoever isn't placed in an arm yet (flags still loading, or a failed lookup) gets `control`.
 * Development and e2e follow the test arm, as `useFeatureFlag` does for every other flag.
 */
export default function useSongPreviewRedesign(): boolean {
  const variant = useFeatureFlagVariantKey(FeatureFlags.SongPreviewRedesign);

  if (isDev() || isE2E()) return true;

  return variant === 'test';
}
