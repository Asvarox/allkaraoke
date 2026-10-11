import posthog from 'posthog-js';
import { useEffect, useState } from 'react';

import { FeatureFlags } from '~/modules/utils/feature-flags';
import isDev from '~/modules/utils/is-dev';
import isE2E from '~/modules/utils/is-e2-e';
import { IsCalibratedSetting } from '~/routes/settings/settings-state';

/** How long an uncalibrated player waits for PostHog before falling back to `control`. */
const EVALUATION_TIMEOUT_MS = 1_500;

/**
 * The `calibration_before_first_song` experiment: does showing the calibration before the first song
 * make players finish more songs, and more of each song?
 *
 * - `control` - the calibration modal before the first song, as before
 * - `test` - no modal; the player is marked as calibrated and can still sync from the Pause Menu or Settings
 *
 * The flag is only read for players who haven't calibrated yet, as reading it is what enrols them, so
 * returning players don't dilute the results. Whoever can't be placed in time gets `control`.
 *
 * - `pending` - the arm isn't known yet, render neither the modal nor the song
 * - `show` - show the calibration
 * - `hide` - already calibrated (or the `test` arm), start the song
 */
export type CalibrationGate = 'pending' | 'show' | 'hide';

export default function useCalibrationBeforeFirstSong(isCalibrated: boolean): CalibrationGate {
  const [arm, setArm] = useState<'control' | 'test'>();

  useEffect(() => {
    // E2E and local development stay on `control` - the `test` arm persists the calibrated setting
    if (isCalibrated || arm || isE2E() || isDev()) return;

    const timeout = setTimeout(() => setArm('control'), EVALUATION_TIMEOUT_MS);
    const unsubscribe = posthog.onFeatureFlags(() => {
      clearTimeout(timeout);
      setArm(posthog.getFeatureFlag(FeatureFlags.CalibrationBeforeFirstSong) === 'test' ? 'test' : 'control');
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [isCalibrated, arm]);

  useEffect(() => {
    if (arm === 'test') IsCalibratedSetting.set(true);
  }, [arm]);

  if (isCalibrated) return 'hide';
  if (isE2E() || isDev() || arm === 'control') return 'show';

  return 'pending';
}
