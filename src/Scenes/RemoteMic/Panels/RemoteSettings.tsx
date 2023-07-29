import styled from '@emotion/styled';
import { MenuButton } from 'Elements/Menu';
import WebRTCClient from 'RemoteMic/Network/WebRTCClient';
import { MIC_ID_KEY } from 'RemoteMic/Network/WebSocketsClient';
import ManagePlayers from 'Scenes/RemoteMic/Panels/RemoteSettings/ManagePlayers';
import { ConnectionStatuses } from 'Scenes/RemoteMic/RemoteMic';
import usePermissions from 'Scenes/RemoteMic/hooks/usePermissions';
import { PeerErrorType } from 'interfaces';

interface Props {
    roomId: string;
    connectionStatus: ConnectionStatuses;
    connectionError?: PeerErrorType;
    isKeepAwakeOn: boolean;
    setIsKeepAwakeOn: (keepAwake: boolean) => void;
    monitoringStarted: boolean;
    setMonitoringStarted: (micMonitoring: boolean) => void;
}

function RemoteSettings({
    roomId,
    monitoringStarted,
    setMonitoringStarted,
    isKeepAwakeOn,
    setIsKeepAwakeOn,
    connectionError,
    connectionStatus,
}: Props) {
    const permissions = usePermissions();
    const reset = () => {
        WebRTCClient.disconnect();
        localStorage.removeItem('remote_mic_name');
        localStorage.removeItem(MIC_ID_KEY);
        window.location.reload();
    };
    return (
        <Container>
            <h3>
                Remote mic ID:{' '}
                <strong data-test="remote-mic-id">
                    {WebRTCClient.getClientId()?.slice(-4).toUpperCase() ?? '----'}
                </strong>
            </h3>
            <MenuButton onClick={reset} size="small" data-test="reset-microphone">
                Reset microphone
            </MenuButton>
            <h5>Removes all persisted microphone data.</h5>
            <hr />
            {permissions === 'write' && <ManagePlayers />}
        </Container>
    );
}
export default RemoteSettings;

const Container = styled.div`
    font-size: 2.6rem;
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.5);
    height: 100%;
    padding: 1.5rem;
    box-sizing: border-box;
    gap: 1rem;
`;
