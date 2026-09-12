import { ComponentProps } from 'react';

import { Icon } from '~/modules/elements/akui/icon';
import usePlayerMicStatus from '~/modules/hooks/players/use-player-mic-status';
import { PlayerNumber } from '~/modules/players/player-number';
import { cn } from '~/utils/cn';

import Ping from './ping';

interface Props extends ComponentProps<'div'> {
  playerNumber: PlayerNumber;
  tooltipPosition?: 'start' | 'end';
}

function PlayerStatus({ playerNumber, tooltipPosition = 'end', className, ...restProps }: Props) {
  const status = usePlayerMicStatus(playerNumber);

  return (
    <div
      {...restProps}
      className={cn('relative flex w-full items-center justify-end gap-2', className)}
      data-test="player-mic-status">
      <Ping playerNumber={playerNumber} />
      {status === 'ok' ? (
        <div
          data-test="status-ok"
          className="m-[0.15rem] inline-block h-6 w-6 rounded-full border border-black bg-white max-lg:h-4 max-lg:w-4"
        />
      ) : status === 'unavailable' ? (
        <Icon icon="ic:baseline-error" size={6} data-test="status-unavailable" className="text-danger" />
      ) : (
        <Icon
          icon="ic:baseline-warning"
          size={6}
          data-test="status-unstable"
          className="text-warning"
          style={{ stroke: 'black' }}
        />
      )}
      {status !== 'ok' ? (
        <div
          className={`text-md absolute -top-3 flex w-80 translate-x-4 items-center rounded-xl bg-black/75 p-2 ${
            tooltipPosition === 'end' ? 'right-auto left-full' : 'right-full left-auto'
          }`}>
          {status === 'unavailable' ? (
            <span>
              The device is <strong>disconnected</strong>. Reconnect it, please.
            </span>
          ) : status === 'unstable' ? (
            <span>
              The connection is <strong>unstable</strong>. Check your Wi-Fi signal.
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
export default PlayerStatus;
