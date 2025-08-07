import { throttle } from 'es-toolkit';
import SimplifiedMic from 'modules/GameEngine/Input/SimplifiedMic';
import events from 'modules/GameEvents/GameEvents';
import { useEventListener } from 'modules/GameEvents/hooks';
import { useEffect, useMemo, useState } from 'react';
import VolumeIndicator from 'routes/RemoteMic/Panels/Microphone/VolumeIndicator';

interface Props {
  isVisible: boolean;
  isMicOn: boolean;
  isConnected: boolean;
  showPlayerChangeModal?: boolean;
}

function MicPreview({ isVisible, isMicOn, isConnected, showPlayerChangeModal }: Props) {
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
        showPlayerChangeModal={showPlayerChangeModal}
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
