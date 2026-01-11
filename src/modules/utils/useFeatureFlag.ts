import { useFeatureFlagEnabled } from 'posthog-js/react';
import { ValuesType } from 'utility-types';
import { FeatureFlags } from '~/modules/utils/featureFlags';
import isDev from '~/modules/utils/isDev';
import isE2E from '~/modules/utils/isE2E';

export default function useFeatureFlag(flag: ValuesType<typeof FeatureFlags>) {
  const flags = useFeatureFlagEnabled(flag);

  return isDev() || isE2E() ? true : flags;
}
