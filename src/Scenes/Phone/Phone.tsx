import styled from '@emotion/styled';
import NoSleep from '@uriopass/nosleep.js';
import { typography } from 'Elements/cssMixins';
import { Input } from 'Elements/Input';
import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import { throttle } from 'lodash-es';
import { FormEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { useEventEffect, useEventListener } from 'Scenes/Game/Singing/Hooks/useEventListener';
import VolumeIndicator from 'Scenes/Phone/VolumeIndicator';
import createPersistedState from 'use-persisted-state';
import WebRTCClient from './WebRTCClient';
import PhoneMic from 'Scenes/Game/Singing/Input/PhoneMic';

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

    const [isKeepAwakeOn, setIsKeepAwakeOn] = useState(false);

    const setKeepAwake = async (turnOn: boolean) => {
        try {
            if (turnOn && !noSleep.isEnabled) {
                await noSleep.enable();
            } else if (!turnOn && noSleep.isEnabled) {
                await noSleep.disable();
            }
            setIsKeepAwakeOn(turnOn);
        } catch (e) {
            console.warn('Couldnt set wakelock', e);
        }
    };

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
        PhoneMic.startMonitoring(undefined, true);
        return PhoneMic.addListener(updateVolumes);
    }, [updateVolumes]);

    const disabled = connectionStatus !== 'uninitialised';

    const onConnect: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
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
                <Form onSubmit={onConnect}>
                    <Input
                        focused={false}
                        label="Name"
                        value={name}
                        onChange={setName}
                        ref={inputRef}
                        disabled={disabled}
                        data-test="player-name-input"
                    />
                    <MenuButton type="submit" disabled={disabled || name === ''} data-test="connect-button">
                        {connectionStatus === 'uninitialised' ? 'Connect' : connectionStatus.toUpperCase()}
                    </MenuButton>
                </Form>
                <KeepAwake onClick={() => setKeepAwake(!isKeepAwakeOn)}>
                    WakeLock: <strong>{isKeepAwakeOn ? 'ON' : 'OFF'}</strong>
                </KeepAwake>
                <MicInputState
                    onClick={() =>
                        monitoringStarted ? PhoneMic.stopMonitoring() : PhoneMic.startMonitoring(undefined, false)
                    }>
                    Microphone: <strong data-test="monitoring-state">{monitoringStarted ? 'ON' : 'OFF'}</strong>
                </MicInputState>
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
const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

const MicInputState = styled.div`
    ${typography}
    strong {
        color: ${styles.colors.text.active};
    }
    align-self: flex-end;
`;
const KeepAwake = styled(MicInputState)`
    margin-top: auto;
`;
