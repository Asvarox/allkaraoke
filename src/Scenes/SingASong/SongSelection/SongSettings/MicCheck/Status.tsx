import styled from '@emotion/styled';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { typography } from 'Elements/cssMixins';
import { inputStatus } from 'Scenes/Game/Singing/Input/Interface';

interface Props {
    status: inputStatus;
}

function PlayerStatus({ status }: Props) {
    return (
        <PingContainer>
            {status === 'ok' ? (
                <OkIcon data-test="status-ok" />
            ) : status === 'unavailable' ? (
                <UnavailableIcon data-test="status-unavailable" />
            ) : (
                <UnstableIcon data-test="status-unstable" />
            )}
            {status === 'unavailable' ? (
                <StatusDescription>
                    <span>
                        The device is <strong>disconnected</strong>. Reconnect it, please.
                    </span>
                </StatusDescription>
            ) : status === 'unstable' ? (
                <StatusDescription>
                    <span>
                        The connection seems <strong>unstable</strong>. Connect to the same Wifi.
                    </span>
                </StatusDescription>
            ) : null}
        </PingContainer>
    );
}
export default PlayerStatus;

const PingContainer = styled.span`
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
    font-size: 3rem;
    z-index: 10;
    svg {
        width: 3rem;
        height: 3rem;
        text-shadow: black;
    }
`;

const OkIcon = styled(CheckCircleIcon)`
    fill: #ffffff;
`;

const UnavailableIcon = styled(ErrorIcon)`
    fill: #ff0000;
`;

const UnstableIcon = styled(WarningIcon)`
    fill: #f89400;
    stroke: black;
`;

const StatusDescription = styled.div`
    ${typography};
    position: absolute;
    left: 100%;
    top: -0.5rem;
    font-size: 1.5rem;
    height: 100%;
    display: flex;
    align-items: center;
    width: 25rem;
    background: rgba(0, 0, 0, 0.75);
    padding: 0.5rem;
    margin-left: 2rem;
`;
