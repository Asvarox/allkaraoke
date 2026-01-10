import storage from 'modules/utils/storage';
import { cloneElement, ComponentProps, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Tooltip as ReactTooltip, TooltipRefProps } from 'react-tooltip';
import { twc } from 'react-twc';

export const StyledTooltip = twc(ReactTooltip)`
  !bg-black/85 !py-2.5 !px-4 !rounded-2.5 !max-w-[450px]
  typography
  [&_.MuiTooltip-arrow::before]:!bg-black/85
  [&_strong]:text-active
  z-[10000]
  !text-lg
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

const OkButtonWrapper = twc.div`flex justify-end mt-2.5`;

const OkButton = twc.button`
  px-5 py-0.5 font-bold cursor-pointer text-white border border-white rounded-1 bg-none text-md
  hover:text-active hover:border-active
  active:text-white active:bg-active active:border-none
`;
