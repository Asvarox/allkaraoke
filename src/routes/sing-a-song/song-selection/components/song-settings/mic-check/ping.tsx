import { PlayerNumber } from '~/modules/players/player-number';
import { ComponentProps } from 'react';
import PlayersManager from '~/modules/players/players-manager';
import { useDevicePing } from '~/routes/select-input/hooks/use-device-ping';

interface Props extends ComponentProps<'span'> {
  playerNumber: PlayerNumber;
}

function Ping({ playerNumber, ...restProps }: Props) {
  const latency = useDevicePing(PlayersManager.getPlayer(playerNumber)?.input?.deviceId);

  return <>{latency !== null ? <span {...restProps}>{latency}ms</span> : ''}</>;
}
export default Ping;
