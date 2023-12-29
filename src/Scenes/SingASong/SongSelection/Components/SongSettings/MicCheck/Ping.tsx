import styled from '@emotion/styled';
import PlayersManager from 'Players/PlayersManager';
import { useDevicePing } from 'Scenes/SelectInput/hooks/useDevicePing';

interface Props {
  playerNumber: number;
}

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
