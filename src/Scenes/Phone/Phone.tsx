import styled from '@emotion/styled';
import NoSleep from '@uriopass/nosleep.js';
import { typography } from 'Elements/cssMixins';
import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import { throttle } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { useEventEffect, useEventListener } from 'Scenes/Game/Singing/Hooks/useEventListener';
import MicInput from 'Scenes/Game/Singing/Input/MicInput';
import { Input } from 'Scenes/Game/SongSelection/Input';
import VolumeIndicator from 'Scenes/Phone/VolumeIndicator';
import createPersistedState from 'use-persisted-state';
import WebRTCClient from './WebRTCClient';

interface Props {
    roomId: string;
}

const usePersistedName = createPersistedState<string>('remote_mic_name');

const noSleep = new NoSleep();

function Phone({ roomId }: Props) {
    const [name, setName] = usePersistedName('');
    const [volume, setVolume] = useState(0);
    const [frequency, setFrequency] = useState(0);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [connectionStatus] = useEventListener(events.karaokeConnectionStatusChange) ?? ['uninitialised'];
    const [playerNumber] = useEventListener(events.remoteMicPlayerNumberSet) ?? [null];

    const [monitoringStarted, setMonitoringStarted] = useState(false);
    useEventEffect(events.micMonitoringStarted, () => setMonitoringStarted(true));
    useEventEffect(events.micMonitoringStopped, () => setMonitoringStarted(false));

    const [keepAwake, setKeepAwake] = useState(false);
    useEffect(() => {
        if (keepAwake && !noSleep.isEnabled) {
            noSleep.enable();
        } else if (!keepAwake && noSleep.isEnabled) {
            noSleep.disable();
        }
    }, [keepAwake]);

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
        setKeepAwake(true);
        try {
            process.env.NODE_ENV !== 'development' && document.body.requestFullscreen().catch(console.info);
        } catch (e) {}
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
                <KeepAwake onClick={() => setKeepAwake((current) => !current)}>
                    WakeLock: <strong>{keepAwake ? 'ON' : 'OFF'}</strong>
                </KeepAwake>
                <KeepAwake onClick={() => (monitoringStarted ? MicInput.stopMonitoring() : MicInput.startMonitoring())}>
                    Microphone: <strong>{monitoringStarted ? 'ON' : 'OFF'}</strong>
                </KeepAwake>
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

const KeepAwake = styled.div`
    ${typography}
    strong {
        color: ${styles.colors.text.active};
    }
    align-self: flex-end;
    margin-top: auto;
`;
