import styled from '@emotion/styled';
import { cloneElement, ComponentProps, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Tooltip as ReactTooltip, TooltipRefProps } from 'react-tooltip';
import { typography } from '~/modules/Elements/cssMixins';
import styles from '~/modules/GameEngine/Drawing/styles';
import storage from '~/modules/utils/storage';

export const StyledTooltip = styled(ReactTooltip)`
  &&& {
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
  }
  z-index: 10000;
`;
interface Props {
  clickable?: boolean;
  open?: boolean;
  hidden?: boolean;
  title: string | ReactElement;
  children: ReactElement<any>;
  place?: ComponentProps<typeof ReactTooltip>['place'];
}
export const Tooltip = ({ children, title, open, ...props }: Props) => {
  const tooltipRef = useRef<TooltipRefProps>(null);
  const id = useMemo(() => `${Math.random()}`, []);

  return (
    <>
      {createPortal(
        <StyledTooltip {...props} id={id} ref={tooltipRef} isOpen={open}>
          {title}
        </StyledTooltip>,
        document.body,
      )}

      {cloneElement(children, { 'data-tooltip-id': id })}
    </>
  );
};

const getDismissKey = (key: string) => `tooltip_dismissed_${key}`;

export const ClosableTooltip = ({
  dismissKey,
  timeoutMs,
  oneTime = true,
  children,
  title,
  ...props
}: ComponentProps<typeof Tooltip> & { dismissKey: string; timeoutMs?: number; oneTime?: boolean }) => {
  const [opened, setOpened] = useState<boolean | undefined>(!storage.local.getItem(getDismissKey(dismissKey)));

  const handleClose = useCallback(() => {
    storage.local.setItem(getDismissKey(dismissKey), true);
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
      clickable
      key={uncontrolled ? 'uncontrolled' : 'controlled'}
      open={uncontrolled ? props.open : opened}
      hidden={props.open === false}
      {...props}
      title={
        <>
          {title}
          {opened && (
            <OkButtonWrapper>
              <OkButton data-test="close-tooltip-button" onClick={handleClose}>
                Close
              </OkButton>
            </OkButtonWrapper>
          )}
        </>
      }>
      {children}
    </Tooltip>
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
