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
    {/* A real 2-column flex row: the label takes exactly what's left after the value, so it only
        truncates when the value actually needs the room (a short value like "NO" leaves the label
        untouched). `popLayout` lets the value animate in/out with `position: absolute` applied only
        to the exiting node, so the crossfade doesn't require constraining both sides to fixed guesses. */}
    <span className="min-w-0 flex-1 truncate font-normal">{label ? <>{label}:</> : ''}</span>
    <AnimatePresence mode="popLayout">
      <motion.span
        layout
        className="text-active max-w-[50%] flex-none overflow-hidden pl-2.5 text-ellipsis whitespace-nowrap"
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
