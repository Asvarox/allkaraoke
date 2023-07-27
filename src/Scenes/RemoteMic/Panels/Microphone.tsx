import styled from '@emotion/styled';
import { MenuButton } from 'Elements/Menu';
import { typography } from 'Elements/cssMixins';
import { transportErrorReason } from 'RemoteMic/Network/TheClient';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import SimplifiedMic from 'Scenes/Game/Singing/Input/SimplifiedMic';
import Connect from 'Scenes/RemoteMic/Panels/Microphone/Connect';
import RemoteMicKeyboard from 'Scenes/RemoteMic/Panels/Microphone/Keyboard';
import MicPreview from 'Scenes/RemoteMic/Panels/Microphone/MicPreview';
import Ping from 'Scenes/RemoteMic/Panels/Microphone/Ping';
import { ConnectionStatuses } from 'Scenes/RemoteMic/RemoteMic';
import usePermissions from 'Scenes/RemoteMic/hooks/usePermissions';
import UserMediaEnabled from 'UserMedia/UserMediaEnabled';
import { useState } from 'react';
import isDev from 'utils/isDev';

interface Props {
    roomId: string;
    connectionStatus: ConnectionStatuses;
    connectionError?: transportErrorReason;
    isKeepAwakeOn: boolean;
    setIsKeepAwakeOn: (keepAwake: boolean) => void;
    monitoringStarted: boolean;
    setMonitoringStarted: (micMonitoring: boolean) => void;
}

function Microphone({
    roomId,
    monitoringStarted,
    setMonitoringStarted,
    isKeepAwakeOn,
    setIsKeepAwakeOn,
    connectionError,
    connectionStatus,
}: Props) {
    const permissions = usePermissions();
    const [searchActive, setSearchActive] = useState(false);

    const onConnect = async () => {
        setIsKeepAwakeOn(true);

        try {
            if (!isDev()) {
                await document.body.requestFullscreen();
                window.screen.orientation.unlock();
                await window.screen.orientation.lock('portrait');
            }
        } catch (e) {
            console.warn(e);
        }
    };

    const isConnected = connectionStatus === 'connected';

    const micPreview = <MicPreview isVisible isMicOn={monitoringStarted} isConnected={isConnected} />;

    return (
        <Container>
            <UserMediaEnabled
                showImages={false}
                fallback={
                    <>
                        {micPreview}
                        <h2>Please allow access to the microphone.</h2>
                    </>
                }>
                <Panel collapse={searchActive}>
                    <MicPreview isVisible isMicOn={monitoringStarted} isConnected={isConnected} />
                    <Connect
                        roomId={roomId}
                        isVisible={true}
                        connectionStatus={connectionStatus}
                        onConnect={onConnect}
                        connectionError={connectionError}
                    />
                </Panel>
                <Panel>
                    {permissions === 'write' && <RemoteMicKeyboard onSearchStateChange={setSearchActive} />}
                    {permissions === 'read' && (
                        <NoPermissionsMsg data-test="no-permissions-message">
                            No permission to control the game. Go to in-game <strong>Settings</strong> menu ➔{' '}
                            <strong>Remote Microphones Settings</strong> to manage them.
                        </NoPermissionsMsg>
                    )}
                    <KeepAwake onClick={() => setIsKeepAwakeOn(!isKeepAwakeOn)}>
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
                    {isConnected && (
                        <KeepAwake>
                            Ping: <Ping />
                        </KeepAwake>
                    )}
                </Panel>
            </UserMediaEnabled>
        </Container>
    );
}
export default Microphone;

const Container = styled.div`
    font-size: 2.6rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 1.5rem;
    box-sizing: border-box;

    @media (max-height: 500px) and (min-aspect-ratio: 16/10) {
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

const Panel = styled.div<{ collapse?: boolean }>`
    flex: 1;
    transition: 300ms ease-in-out;

    margin-top: ${(props) => (props.collapse ? '-100%' : '0')};

    @media (max-height: 500px) and (min-aspect-ratio: 16/10) {
        margin-top: 0;
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

const NoPermissionsMsg = styled.h5`
    padding-bottom: 5rem;
`;
