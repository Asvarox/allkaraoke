import { throttle } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { useEventListener } from 'Scenes/Game/Singing/Hooks/useEventListener';
import VolumeIndicator from './VolumeIndicator';
import PhoneMic from 'Scenes/Game/Singing/Input/PhoneMic';

interface Props {
    isVisible: boolean;
    isMicOn: boolean;
}

function MicPreview({ isVisible, isMicOn }: Props) {
    const [volume, setVolume] = useState(0);
    const [frequency, setFrequency] = useState(0);
    const [playerNumber] = useEventListener(events.remoteMicPlayerNumberSet) ?? [null];

    const updateVolumes = useCallback(
        throttle((freqs: number[], volumes: number[]) => {
            setFrequency(freqs[0]);
            setVolume(volumes[0]);
        }, 150),
        [setVolume, setFrequency],
    );

    useEffect(() => {
        PhoneMic.startMonitoring(undefined);
        return PhoneMic.addListener(updateVolumes);
    }, [updateVolumes]);

    return isVisible ? (
        <>
            <VolumeIndicator volume={volume} frequency={frequency} playerNumber={playerNumber} isMicOn={isMicOn} />
        </>
    ) : null;
}
export default MicPreview;
