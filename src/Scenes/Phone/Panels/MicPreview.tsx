import { throttle } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import events from 'GameEvents/GameEvents';
import { useEventListener } from 'GameEvents/hooks';
import VolumeIndicator from './VolumeIndicator';
import PhoneMic from 'Scenes/Game/Singing/Input/PhoneMic';

interface Props {
    isVisible: boolean;
    isMicOn: boolean;
    isConnected: boolean;
}

function MicPreview({ isVisible, isMicOn, isConnected }: Props) {
    const [volume, setVolume] = useState(0);
    const [frequency, setFrequency] = useState(0);
    const [playerNumber] = useEventListener(events.remoteMicPlayerNumberSet) ?? [null];

    const updateVolumes = useCallback(
        throttle((freq: number, volume: number) => {
            setFrequency(freq);
            setVolume(volume);
        }, 150),
        [setVolume, setFrequency],
    );

    useEffect(() => {
        PhoneMic.startMonitoring(undefined);
        return PhoneMic.addListener(updateVolumes);
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
