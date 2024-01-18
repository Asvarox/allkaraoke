import { useEffect, useState } from 'react';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { inputStatus } from 'Scenes/Game/Singing/Input/Interface';

const usePlayerMicStatus = (
  playerNumber: 0 | 1 | 2 | 3,
  intervalMs = 333,
  onMeasure?: ([volume, frequency]: [number, number]) => void,
) => {
  const [data, setData] = useState<inputStatus>('ok');

  useEffect(() => {
    const interval = setInterval(() => {
      setData(InputManager.getInputStatus(playerNumber));
    }, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [playerNumber, intervalMs, onMeasure]);

  return data;
};

export default usePlayerMicStatus;
