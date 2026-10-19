import { useEffect, useState } from 'react';

import { MasterMutedSetting, MasterVolumeSetting } from '~/routes/settings/settings-state';

/** The multiplier (0-1) every sound, music track and video is played at. */
export const getMasterGain = () => (MasterMutedSetting.get() ? 0 : MasterVolumeSetting.get());

export const toggleMasterMute = () => {
  MasterMutedSetting.set(!MasterMutedSetting.get());
};

/** Calls `callback` now and on every master volume / mute change; returns the unsubscribe. */
export const subscribeToMasterGain = (callback: (gain: number) => void) => {
  const notify = () => callback(getMasterGain());
  const removeVolume = MasterVolumeSetting.addListener(notify);
  const removeMuted = MasterMutedSetting.addListener(notify);
  notify();

  return () => {
    removeVolume();
    removeMuted();
  };
};

export function useMasterGain() {
  const [gain, setGain] = useState(getMasterGain);
  useEffect(() => subscribeToMasterGain(setGain), []);

  return gain;
}
