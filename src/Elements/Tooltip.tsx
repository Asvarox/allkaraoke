import styled from '@emotion/styled';
import MuiTooltip from '@mui/material/Tooltip';
import { typography } from 'Elements/cssMixins';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { ComponentProps, useCallback, useEffect, useState } from 'react';
import storage from 'utils/storage';

const ToBeStyledTooltip = ({ className, ...props }: ComponentProps<typeof MuiTooltip>) => (
  <MuiTooltip arrow {...props} classes={{ tooltip: className }} />
);

export const Tooltip = styled(ToBeStyledTooltip)`
  background: rgba(0, 0, 0, 0.85);
  font-size: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  max-width: 45rem;
  ${typography};
  .MuiTooltip-arrow {
    &::before {
      background: rgba(0, 0, 0, 0.85);
    }
  }

  strong {
    color: ${styles.colors.text.active};
  }
`;

const getDismissKey = (key: string) => `tooltip_dismissed_${key}`;

export const ClosableTooltip = ({
  dismissKey,
  timeoutMs,
  oneTime = true,
  ...props
}: ComponentProps<typeof Tooltip> & { dismissKey: string; timeoutMs?: number; oneTime?: boolean }) => {
  const [opened, setOpened] = useState<boolean | undefined>(!storage.local.getValue(getDismissKey(dismissKey)));

  const handleClose = useCallback(() => {
    storage.local.storeValue(getDismissKey(dismissKey), true);
    setOpened(undefined);
  }, [dismissKey]);

  useEffect(() => {
    if (timeoutMs) {
      const timeout = setTimeout(handleClose, timeoutMs);
      return () => clearTimeout(timeout);
    }
  }, [timeoutMs, handleClose]);

  const uncontrolled = (opened === undefined || (!opened && !oneTime)) && props.open === undefined;

  return (
    <Tooltip
      key={uncontrolled ? 'uncontrolled' : 'controlled'}
      open={uncontrolled ? props.open : opened}
      {...props}
      title={
        <>
          {props.title}
          {opened && (
            <OkButtonWrapper>
              <OkButton data-test="close-tooltip-button" onClick={handleClose}>
                Close
              </OkButton>
            </OkButtonWrapper>
          )}
        </>
      }
    />
  );
};

const OkButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const OkButton = styled.button`
  padding: 0.25rem 2rem;
  font-weight: bold;
  cursor: pointer;
  color: white;
  border: 1px solid white;
  border-radius: 0.5rem;
  background: none;
  font-size: 1.75rem;
  &:hover {
    color: ${styles.colors.text.active};
    border-color: ${styles.colors.text.active};
  }

  &:active {
    color: white;
    background: ${styles.colors.text.active};
    border-color: none;
  }
`;
