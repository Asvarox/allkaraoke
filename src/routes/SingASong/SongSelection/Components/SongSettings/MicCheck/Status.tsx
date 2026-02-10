import styled from '@emotion/styled';
import { Error as ErrorIcon, Warning as WarningIcon } from '@mui/icons-material';
import { ComponentProps } from 'react';
import { mobileMQ, typography } from '~/modules/Elements/cssMixins';
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
        <OkIcon data-test="status-ok" />
      ) : status === 'unavailable' ? (
        <UnavailableIcon data-test="status-unavailable" />
      ) : (
        <UnstableIcon data-test="status-unstable" />
      )}
      {status === 'unavailable' ? (
        <StatusDescription position={tooltipPosition}>
          <span>
            The device is <strong>disconnected</strong>. Reconnect it, please.
          </span>
        </StatusDescription>
      ) : status === 'unstable' ? (
        <StatusDescription position={tooltipPosition}>
          <span>
            The connection seems <strong>unstable</strong>. Connect to the same Wifi.
          </span>
        </StatusDescription>
      ) : null}
    </div>
  );
}
export default PlayerStatus;

const OkIcon = styled.div`
  margin: 0.15rem;
  width: 1.5rem;
  height: 1.5rem;
  ${mobileMQ} {
    width: 1rem;
    height: 1rem;
  }
  display: inline-block;
  background: #ffffff;
  border: 1px solid black;
  border-radius: 50%;
`;

const UnavailableIcon = styled(ErrorIcon)`
  fill: #ff0000;
`;

const UnstableIcon = styled(WarningIcon)`
  fill: #f89400;
  stroke: black;
`;

const StatusDescription = styled.div<{ position: Props['tooltipPosition'] }>`
  ${typography};
  position: absolute;
  left: ${(props) => (props.position === 'end' ? '100%' : 'auto')};
  right: ${(props) => (props.position === 'end' ? 'auto' : '100%')};
  top: 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  width: 20rem;
  background: rgba(0, 0, 0, 0.75);
  padding: 0.5rem;
`;
