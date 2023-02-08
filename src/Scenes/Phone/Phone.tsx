import styled from '@emotion/styled';
import NoSleep from '@uriopass/nosleep.js';
import { typography } from 'Elements/cssMixins';
import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import { useEffect, useRef, useState } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { useEventEffect, useEventListener } from 'Scenes/Game/Singing/Hooks/useEventListener';
import PhoneMic from 'Scenes/Game/Singing/Input/PhoneMic';
import UserMediaEnabled from 'UserMedia/UserMediaEnabled';
import NormalizeFontSize from 'Elements/NormalizeFontSize';
import PhoneKeyboard from './Panels/Keyboard';
import MicPreview from 'Scenes/Phone/Panels/MicPreview';
import Connect from 'Scenes/Phone/Panels/Connect';

interface Props {
    roomId: string;
}

const noSleep = new NoSleep();

function Phone({ roomId }: Props) {
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

    const onConnect = () => {
        setKeepAwake(true);
    };

    return (
        <>
            <NormalizeFontSize size={10} />
            <LayoutWithBackground>
                <Container>
                    <MicPreview isVisible isMicOn={monitoringStarted} />
                    <UserMediaEnabled fallback={<h2>Please allow access to the microphone.</h2>}>
                        <Connect
                            roomId={roomId}
                            isVisible={true}
                            connectionStatus={connectionStatus}
                            onConnect={onConnect}
                        />
                        <PhoneKeyboard />
                        <KeepAwake onClick={() => setKeepAwake(!isKeepAwakeOn)}>
                            WakeLock: <strong>{isKeepAwakeOn ? 'ON' : 'OFF'}</strong>
                        </KeepAwake>
                        <MicInputState
                            onClick={() =>
                                monitoringStarted ? PhoneMic.stopMonitoring() : PhoneMic.startMonitoring(undefined)
                            }>
                            Microphone: <strong data-test="monitoring-state">{monitoringStarted ? 'ON' : 'OFF'}</strong>
                        </MicInputState>
                    </UserMediaEnabled>
                </Container>
            </LayoutWithBackground>
        </>
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
