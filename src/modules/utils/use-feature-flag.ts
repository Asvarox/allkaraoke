import { useFeatureFlagEnabled } from 'posthog-js/react';
import { ValuesType } from 'utility-types';
import { FeatureFlags } from '~/modules/utils/feature-flags';
import isDev from '~/modules/utils/is-dev';
import isE2E from '~/modules/utils/is-e2-e';

export default function useFeatureFlag(flag: ValuesType<typeof FeatureFlags>) {
  const flags = useFeatureFlagEnabled(flag);

  return isDev() || isE2E() ? true : flags;
}
