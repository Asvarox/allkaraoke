import { useEffect, useState } from 'react';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import styled from '@emotion/styled';

interface Props {
    playerNumber: number;
}

function Ping({ playerNumber }: Props) {
    const [latency, setLatency] = useState<number | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const deviceId = InputManager.getPlayerInput(playerNumber)?.deviceId ?? '';
            const remoteMic = RemoteMicManager.getRemoteMicById(deviceId);

            setLatency(remoteMic ? remoteMic.getLatency() : null);
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [playerNumber]);
    return <>{latency !== null ? <PingContainer>{latency}ms</PingContainer> : ''}</>;
}
export default Ping;

const PingContainer = styled.span`
    position: absolute;
    right: 0.5rem;
    bottom: 0.5rem;
    font-size: 1.75rem;
`;
