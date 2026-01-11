import { ComponentProps } from 'react';
import PlayersManager from '~/modules/Players/PlayersManager';
import { useDevicePing } from '~/routes/SelectInput/hooks/useDevicePing';

interface Props extends ComponentProps<'span'> {
  playerNumber: 0 | 1 | 2 | 3;
}

function Ping({ playerNumber, ...restProps }: Props) {
  const latency = useDevicePing(PlayersManager.getPlayer(playerNumber)?.input?.deviceId);
  //   const latency = 100; //useDevicePing(PlayersManager.getPlayer(playerNumber)?.input?.deviceId);

  return <>{latency !== null ? <span {...restProps}>{latency}ms</span> : ''}</>;
}
export default Ping;
