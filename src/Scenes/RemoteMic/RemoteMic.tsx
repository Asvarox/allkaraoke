import styled from '@emotion/styled';
import NoSleep from '@uriopass/nosleep.js';
import { typography } from 'Elements/cssMixins';
import { useBackground } from 'Elements/LayoutWithBackground';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import { useEffect, useRef, useState } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import events from 'GameEvents/GameEvents';
import { useEventEffect, useEventListener } from 'GameEvents/hooks';
import SimplifiedMic from 'Scenes/Game/Singing/Input/SimplifiedMic';
import UserMediaEnabled from 'UserMedia/UserMediaEnabled';
import NormalizeFontSize from 'Elements/NormalizeFontSize';
import RemoteMicKeyboard from './Panels/Keyboard';
import MicPreview from 'Scenes/RemoteMic/Panels/MicPreview';
import Connect from 'Scenes/RemoteMic/Panels/Connect';
import ConfirmReadiness from 'Scenes/RemoteMic/Panels/ConfirmReadiness';

interface Props {
    roomId: string;
}

const noSleep = new NoSleep();

function RemoteMic({ roomId }: Props) {
    useBackground(true);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [connectionStatus] = useEventListener(events.karaokeConnectionStatusChange) ?? ['uninitialised'];

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

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const onConnect = async () => {
        setKeepAwake(true);

        try {
            await document.body.requestFullscreen();
            window.screen.orientation.unlock();
            await window.screen.orientation.lock('portrait');
        } catch (e) {
            console.warn(e);
        }
    };

    const onConfirm = () => {
        setKeepAwake(true);
    };

    const micPreview = (
        <MicPreview isVisible isMicOn={monitoringStarted} isConnected={connectionStatus === 'connected'} />
    );

    return (
        <>
            <NormalizeFontSize size={10} />
            <Container id="phone-ui-container">
                <UserMediaEnabled
                    fallback={
                        <>
                            {micPreview}
                            <h2>Please allow access to the microphone.</h2>
                        </>
                    }>
                    <Panel>
                        <MicPreview
                            isVisible
                            isMicOn={monitoringStarted}
                            isConnected={connectionStatus === 'connected'}
                        />
                        <ConfirmReadiness onConfirm={onConfirm} />
                        <Connect
                            roomId={roomId}
                            isVisible={true}
                            connectionStatus={connectionStatus}
                            onConnect={onConnect}
                        />
                    </Panel>
                    <Panel>
                        <RemoteMicKeyboard />
                        <KeepAwake onClick={() => setKeepAwake(!isKeepAwakeOn)}>
                            WakeLock: <strong>{isKeepAwakeOn ? 'ON' : 'OFF'}</strong>
                        </KeepAwake>
                        <MicInputState
                            onClick={() =>
                                monitoringStarted
                                    ? SimplifiedMic.stopMonitoring()
                                    : SimplifiedMic.startMonitoring(undefined)
                            }>
                            Microphone: <strong data-test="monitoring-state">{monitoringStarted ? 'ON' : 'OFF'}</strong>
                        </MicInputState>
                    </Panel>
                </UserMediaEnabled>
            </Container>
        </>
    );
}
export default RemoteMic;

const Container = styled(MenuContainer)`
    margin: 0 auto;
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;
    height: 100vh;
    max-height: 800px;

    @media (max-height: 500px) and (min-aspect-ratio: 16/10) {
        max-width: 960px;
        flex-wrap: nowrap;
        flex-direction: row;
    }

    ${MenuButton} {
        padding: 0.5em;
        height: 72px;

        margin-bottom: 1em;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5em;
    }

    h5 {
        margin-top: 0.5em;

        svg {
            font-size: 0.9em;
        }
    }
`;

const Panel = styled.div`
    flex: 1;

    @media (max-height: 500px) and (min-aspect-ratio: 16/10) {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
`;

const MicInputState = styled.div`
    ${typography}
    strong {
        color: ${styles.colors.text.active};
    }
    align-self: flex-end;
`;
const KeepAwake = styled(MicInputState)``;
