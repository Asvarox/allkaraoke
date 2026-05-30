import { throttle } from 'es-toolkit';
import { useEffect, useMemo, useState } from 'react';
import SimplifiedMic from '~/modules/game-engine/input/simplified-mic';
import events from '~/modules/game-events/game-events';
import { useEventListener } from '~/modules/game-events/hooks';
import VolumeIndicator from '~/routes/remote-mic/panels/microphone/volume-indicator';

interface Props {
  isVisible: boolean;
  isMicOn: boolean;
  isConnected: boolean;
}

function MicPreview({ isVisible, isMicOn, isConnected }: Props) {
  const [volume, setVolume] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [playerNumber] = useEventListener(events.remoteMicPlayerSet, true) ?? [null];

  const updateVolumes = useMemo(
    () =>
      throttle((freq: number, volume: number) => {
        setFrequency(freq);
        setVolume(volume);
      }, 150),
    [],
  );

  useEffect(() => {
    SimplifiedMic.startMonitoring();
    return SimplifiedMic.addListener(updateVolumes);
  }, [updateVolumes]);

  return isVisible ? (
    <>
      <VolumeIndicator
        volume={volume}
        frequency={frequency}
        playerNumber={playerNumber}
        isMicOn={isMicOn}
        isConnected={isConnected}
      />
    </>
  ) : null;
}
export default MicPreview;
