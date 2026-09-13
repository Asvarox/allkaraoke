import { useFeatureFlagVariantKey } from 'posthog-js/react';
import { useEffect, useState } from 'react';

import { FeatureFlags } from '~/modules/utils/feature-flags';
import isDev from '~/modules/utils/is-dev';
import isE2E from '~/modules/utils/is-e2-e';

/**
 * How long a mobile user waits on a blank setup screen for PostHog to answer before we give up and
 * show them the prompt. Flags are fetched, so there is a window where we don't yet know which arm
 * this user is in - and showing the prompt during it would make the `test` arm flash a modal it is
 * supposed to never show. Whoever we can't place in time gets `control`, the behaviour that existed
 * before the experiment.
 */
const EVALUATION_TIMEOUT_MS = 1_500;

/**
 * The `mobile_mode_auto_opt_in` experiment: does skipping the "Use Mobile Phone Mode?" prompt and
 * turning the mode on for them make mobile users more likely to reach a song?
 *
 * - `control` - the prompt, as before
 * - `test` - Mobile Phone Mode is switched on silently and the prompt never renders
 *
 * Only the first visit of a mobile device is affected: the setting is `null` until either arm (or
 * the Settings menu) writes to it, and an explicit choice is never overwritten.
 *
 * - `pending` - flags haven't been evaluated yet, render neither arm
 * - `enabled` - opt the user in without asking (`test`)
 * - `disabled` - show the prompt (`control`, a failed lookup, or one that arrived too late)
 */
export type MobileModeAutoOptIn = 'pending' | 'enabled' | 'disabled';

export default function useMobileModeAutoOptIn(): MobileModeAutoOptIn {
  const variant = useFeatureFlagVariantKey(FeatureFlags.MobileModeAutoOptIn);
  const [evaluationTimedOut, setEvaluationTimedOut] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setEvaluationTimedOut(true), EVALUATION_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, []);

  // Under e2e it's an opt-in the spec sets instead (`enableAutoMobileMode` in tests/helpers.ts) -
  // the prompt is how every other mobile spec gets into the mode, so forcing the test arm on would
  // rewrite all of them, and the control arm needs coverage of its own while the experiment runs.
  if (isE2E()) return globalThis.isE2EAutoMobileMode ? 'enabled' : 'disabled';
  // Local development follows the test arm, matching how `useFeatureFlag` treats every other flag.
  // Toggle Mobile Phone Mode back off in the Settings menu to get the prompt back.
  if (isDev()) return 'enabled';

  // Latched: once we've given up and shown the prompt, a late `test` must not flip the mode under
  // whoever is reading it - the setting is persisted, so that opt-in would stick.
  if (evaluationTimedOut) return 'disabled';
  if (variant === 'test') return 'enabled';
  if (variant === undefined) return 'pending';

  return 'disabled';
}
