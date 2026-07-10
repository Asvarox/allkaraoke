import { PlayerNumber } from '~/modules/players/player-number';
import { useEffect, useState } from 'react';
import InputManager from '~/modules/game-engine/input/input-manager';
import tuple from '~/modules/utils/tuple';
import { FPSCountSetting } from '~/routes/settings/settings-state';

export const usePlayerMicData = (
  playerNumber: PlayerNumber,
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
  playerNumber: PlayerNumber,
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
