import styled from '@emotion/styled';
import PlayersManager from 'Players/PlayersManager';
import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import { useEffect, useState } from 'react';

interface Props {
  playerNumber: number;
}

export const useDevicePing = (deviceId?: string) => {
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const remoteMic = RemoteMicManager.getRemoteMicById(deviceId ?? '');

      setLatency(remoteMic ? remoteMic.getLatency() : null);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [deviceId]);

  return latency;
};

function Ping({ playerNumber, ...restProps }: Props) {
  const latency = useDevicePing(PlayersManager.getPlayer(playerNumber)?.input?.deviceId);

  return <>{latency !== null ? <PingContainer {...restProps}>{latency}ms</PingContainer> : ''}</>;
}
export default Ping;

const PingContainer = styled.span`
  position: absolute;
  right: 4rem;
  bottom: 0.5rem;
  font-size: 1.75rem;
`;
