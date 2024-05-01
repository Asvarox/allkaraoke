import { useFeatureFlagEnabled } from 'posthog-js/react';
import { ValuesType } from 'utility-types';
import { FeatureFlags } from 'utils/featureFlags';
import isDev from 'utils/isDev';
import isE2E from 'utils/isE2E';

export default function useFeatureFlag(flag: ValuesType<typeof FeatureFlags>) {
  const flags = useFeatureFlagEnabled(flag);

  return isDev() || isE2E() ? true : flags;
}
