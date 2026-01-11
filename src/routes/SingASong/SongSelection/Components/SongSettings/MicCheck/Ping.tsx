import styled from '@emotion/styled';
import { ComponentProps } from 'react';
import PlayersManager from '~/modules/Players/PlayersManager';
import { useDevicePing } from '~/routes/SelectInput/hooks/useDevicePing';

interface Props extends ComponentProps<typeof PingContainer> {
  playerNumber: 0 | 1 | 2 | 3;
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
