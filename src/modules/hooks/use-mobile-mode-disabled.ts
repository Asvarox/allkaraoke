import { useFeatureFlagVariantKey } from 'posthog-js/react';
import { FeatureFlags } from '~/modules/utils/feature-flags';

// This is an experiment (control/test variants), so control is the safe default if evaluation fails.
export default function useMobileModeDisabled() {
  return useFeatureFlagVariantKey(FeatureFlags.DisableMobileMode) === 'test';
}
