import { AnimatePresence, motion } from 'motion/react';
import { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { Menu } from './AKUI/Menu';

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
    className={`${className} shadow-focusable flex justify-start rounded-md`}>
    <span>{label ? <>{label}:</> : ''}</span>{' '}
    <AnimatePresence>
      <motion.span
        className="text-active absolute right-2.5 overflow-hidden pl-2.5 text-ellipsis whitespace-nowrap"
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
