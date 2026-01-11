import { useEffect, useState } from 'react';
import InputManager from '~/modules/GameEngine/Input/InputManager';
import tuple from '~/modules/utils/tuple';
import { FPSCountSetting } from '~/routes/Settings/SettingsState';

export const usePlayerMicData = (
  playerNumber: 0 | 1 | 2 | 3,
  onMeasure: ([volume, frequency]: [number, number]) => void,
  enabled = true,
  intervalMs = 1000 / FPSCountSetting.get(),
) => {
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const playerVolume = InputManager.getPlayerVolume(playerNumber) ?? 0;
      const playerFrequency = InputManager.getPlayerFrequency(playerNumber) ?? 0;
      onMeasure([playerVolume, Array.isArray(playerFrequency) ? playerFrequency[0] : playerFrequency]);
    }, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [playerNumber, intervalMs, onMeasure, enabled]);
};

const usePlayerMic = (
  playerNumber: 0 | 1 | 2 | 3,
  intervalMs = 1000 / FPSCountSetting.get(),
  onMeasure?: ([volume, frequency]: [number, number]) => void,
) => {
  const [data, setData] = useState(tuple([0, 0]));

  usePlayerMicData(playerNumber, setData, true, intervalMs);

  useEffect(() => {
    if (onMeasure) {
      onMeasure(data);
    }
  }, [data, onMeasure]);

  return data;
};

export default usePlayerMic;
