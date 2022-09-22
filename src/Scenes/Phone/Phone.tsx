import styled from '@emotion/styled';
import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import { throttle } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';
import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { useEventListener } from 'Scenes/Game/Singing/Hooks/useEventListener';
import MicInput from 'Scenes/Game/Singing/Input/MicInput';
import { Input } from 'Scenes/Game/SongSelection/Input';
import VolumeIndicator from 'Scenes/Phone/VolumeIndicator';
import createPersistedState from 'use-persisted-state';
import WebRTCClient from './WebRTCClient';

interface Props {
    roomId: string;
}

const usePersistedName = createPersistedState<string>('remote_mic_name');

function Phone({ roomId }: Props) {
    const [name, setName] = usePersistedName('');
    const [volume, setVolume] = useState(0);
    const [frequency, setFrequency] = useState(0);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [connectionStatus] = useEventListener(events.karaokeConnectionStatusChange) ?? ['uninitialised'];
    const [playerNumber] = useEventListener(events.remoteMicPlayerNumberSet) ?? [null];

    const updateVolumes = useCallback(
        throttle((freqs: number[], volumes: number[]) => {
            setFrequency(freqs[0]);
            setVolume(volumes[0]);
        }, 150),
        [setVolume, setFrequency],
    );

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        MicInput.startMonitoring(undefined, true);
        return MicInput.addListener(updateVolumes);
    }, [updateVolumes]);

    const disabled = connectionStatus !== 'uninitialised';

    const onConnect = () => {
        WebRTCClient.connect(roomId, name);
        navigator.wakeLock?.request('screen');
    };

    return (
        <LayoutWithBackground>
            <Container>
                <VolumeIndicator volume={volume} frequency={frequency} playerNumber={playerNumber} />
                <Input
                    focused={false}
                    label="Name"
                    value={name}
                    onChange={setName}
                    ref={inputRef}
                    disabled={disabled}
                    data-test="player-name-input"
                />
                <MenuButton onClick={onConnect} disabled={disabled || name === ''} data-test="connect-button">
                    {connectionStatus === 'uninitialised' ? 'Connect' : connectionStatus.toUpperCase()}
                </MenuButton>
            </Container>
        </LayoutWithBackground>
    );
}
export default Phone;

const Container = styled(MenuContainer)`
    margin: 0 auto;
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;
    height: 100vh;
    max-height: 800px;

    ${MenuButton} {
        padding: 0.5em;
        height: 72px;
    }
`;
