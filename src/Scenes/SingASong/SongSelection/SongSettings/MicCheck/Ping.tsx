import { useEffect, useState } from 'react';
import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import styled from '@emotion/styled';
import PlayersManager from 'Players/PlayersManager';

interface Props {
    playerNumber: number;
}

function Ping({ playerNumber }: Props) {
    const [latency, setLatency] = useState<number | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const deviceId = PlayersManager.getPlayer(playerNumber).input?.deviceId ?? '';
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
    right: 4rem;
    bottom: 0.5rem;
    font-size: 1.75rem;
`;
