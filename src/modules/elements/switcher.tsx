import { AnimatePresence, motion } from 'motion/react';
import { ComponentProps, PropsWithChildren, ReactNode } from 'react';

import { Menu } from './akui/menu';

interface Props extends PropsWithChildren, Omit<ComponentProps<typeof Menu.Button>, 'label' | 'value'> {
  focused?: boolean;
  disabled?: boolean;
  label: ReactNode;
  value: string | number | undefined | null;
  displayValue?: ReactNode;
  info?: ReactNode;
  onClick?: () => void;
}

export const Switcher = ({
  focused,
  disabled = false,
  label,
  value,
  displayValue,
  onClick,
  info,
  children,
  className = '',
  ...restProps
}: Props) => (
  <Menu.Button
    info={info}
    size="small"
    subtleFocused
    data-focused={focused}
    onClick={onClick}
    data-disabled={disabled}
    {...restProps}
    className={`${className} shadow-focusable flex justify-start gap-2`}>
    {/* A real 2-column flex row: the label is never truncated (always fully visible, left-aligned) and
        keeps its natural width; the value takes whatever's left and truncates there. `popLayout` lets
        the value animate in/out with `position: absolute` applied only to the exiting node, so the
        crossfade doesn't fight the flex layout while it settles into the new remaining width. */}
    <span className="shrink-0 font-normal whitespace-nowrap">{label ? <>{label}:</> : ''}</span>
    <AnimatePresence mode="popLayout">
      <motion.span
        layout
        className="text-active min-w-0 flex-1 overflow-hidden pl-2.5 text-right text-ellipsis whitespace-nowrap"
        key={value ?? ''}
        initial={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -20 }}>
        {displayValue ?? value}
      </motion.span>
    </AnimatePresence>
    {children ?? null}
  </Menu.Button>
);
