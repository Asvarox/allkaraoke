import { FeatureFlags } from '~/modules/utils/feature-flags';
import useFeatureFlag from '~/modules/utils/use-feature-flag';

/** Off hides every trace of instrumentals and always plays the original, whatever the player chose before */
export default function useInstrumentalsEnabled() {
  return !!useFeatureFlag(FeatureFlags.Instrumentals);
}
