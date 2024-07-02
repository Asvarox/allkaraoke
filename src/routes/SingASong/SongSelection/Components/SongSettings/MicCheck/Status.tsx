import { styled } from '@linaria/react';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { typography } from 'modules/Elements/cssMixins';
import { inputStatus } from 'modules/GameEngine/Input/Interface';
import { ComponentProps } from 'react';

interface Props extends ComponentProps<typeof StatusContainer> {
  status: inputStatus;
  tooltipPosition?: 'start' | 'end';
}

function PlayerStatus({ status, tooltipPosition = 'end', ...restProps }: Props) {
  return (
    <StatusContainer {...restProps}>
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
    </StatusContainer>
  );
}
export default PlayerStatus;

const StatusContainer = styled.span`
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  font-size: 3rem;
  z-index: 10;
  svg {
    width: 3rem;
    height: 3rem;
    text-shadow: black;
  }
`;

const OkIcon = styled.div`
  margin: 0.15rem;
  width: 2.7rem;
  height: 2.7rem;
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
  right: ${(props) => (props.position === 'end' ? 'auto' : '150%')};
  top: -0.5rem;
  font-size: 1.5rem;
  height: 100%;
  display: flex;
  align-items: center;
  width: 25rem;
  background: rgba(0, 0, 0, 0.75);
  padding: 0.5rem;
  margin-left: 2rem;
`;
