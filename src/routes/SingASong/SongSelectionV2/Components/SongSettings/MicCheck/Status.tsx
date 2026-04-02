import { Error as ErrorIcon, Warning as WarningIcon } from '@mui/icons-material';
import { ComponentProps } from 'react';
import usePlayerMicStatus from '~/modules/hooks/players/usePlayerMicStatus';
import Ping from './Ping';

interface Props extends ComponentProps<'div'> {
  playerNumber: 0 | 1 | 2 | 3;
  tooltipPosition?: 'start' | 'end';
}

function PlayerStatus({ playerNumber, tooltipPosition = 'end', className, ...restProps }: Props) {
  const status = usePlayerMicStatus(playerNumber);

  return (
    <div
      {...restProps}
      className={`relative flex w-full items-center justify-end gap-2 ${className}`}
      data-test="player-mic-status">
      <Ping playerNumber={playerNumber} />
      {status === 'ok' ? (
        <div
          data-test="status-ok"
          className="mobile:w-4 mobile:h-4 m-[0.15rem] inline-block h-6 w-6 rounded-full border border-black bg-white"
        />
      ) : status === 'unavailable' ? (
        <ErrorIcon data-test="status-unavailable" style={{ fill: '#ff0000' }} />
      ) : (
        <WarningIcon data-test="status-unstable" style={{ fill: '#f89400', stroke: 'black' }} />
      )}
      {status === 'unavailable' ? (
        <div
          className={`absolute top-0 flex w-[20rem] items-center bg-black/75 p-2 text-base ${
            tooltipPosition === 'end' ? 'right-auto left-full' : 'right-full left-auto'
          }`}>
          <span>
            The device is <strong>disconnected</strong>. Reconnect it, please.
          </span>
        </div>
      ) : status === 'unstable' ? (
        <div
          className={`absolute top-0 flex w-[20rem] items-center bg-black/75 p-2 text-base ${
            tooltipPosition === 'end' ? 'right-auto left-full' : 'right-full left-auto'
          }`}>
          <span>
            The connection seems <strong>unstable</strong>. Connect to the same Wifi.
          </span>
        </div>
      ) : null}
    </div>
  );
}
export default PlayerStatus;
