import { AnimatePresence, motion } from 'motion/react';
import { ComponentProps, PropsWithChildren, ReactNode } from 'react';

import { cn } from '~/utils/cn';

import { Menu } from './akui/menu';
import { Skeleton } from './akui/skeleton';

/** Keeps the placeholder a state of its own, so the real value crossfades in rather than swapping. */
const LOADING_KEY = '__loading__';

interface Props extends PropsWithChildren, Omit<ComponentProps<typeof Menu.Button>, 'label' | 'value'> {
  focused?: boolean;
  disabled?: boolean;
  label: ReactNode;
  value: string | number | undefined | null;
  displayValue?: ReactNode;
  info?: ReactNode;
  onClick?: () => void;
  /**
   * The value isn't known yet — a placeholder bar stands in for it and the switcher is inert until it
   * arrives. The button is a fixed height, so a screen can render its switcher from the start and let
   * the value fade in rather than growing a control once the value loads.
   */
  loading?: boolean;
}

export const Switcher = ({
  focused,
  disabled = false,
  loading = false,
  label,
  value,
  displayValue,
  onClick,
  info,
  readOnly,
  children,
  className = '',
  ...restProps
}: Props) => (
  <Menu.Button
    info={info}
    size="small"
    subtleFocused
    data-focused={focused}
    onClick={loading ? undefined : onClick}
    data-disabled={disabled}
    readOnly={readOnly || loading}
    {...restProps}
    className={`${className} flex justify-start gap-2`}>
    {/* A real 2-column flex row: the label is never truncated (always fully visible, left-aligned) and
        keeps its natural width; the value takes whatever's left and truncates there. `popLayout` lets
        the value animate in/out with `position: absolute` applied only to the exiting node, so the
        crossfade doesn't fight the flex layout while it settles into the new remaining width. */}
    <span className="shrink-0 font-normal whitespace-nowrap">{label ? <>{label}:</> : ''}</span>
    <AnimatePresence mode="popLayout">
      <motion.span
        layout
        // Disabled greys the value along with the row, the way a disabled Button greys its label.
        className={cn(
          'min-w-0 flex-1 overflow-hidden pl-2.5 text-right text-ellipsis whitespace-nowrap',
          disabled ? 'text-gray-300!' : 'text-active',
        )}
        key={loading ? LOADING_KEY : (value ?? '')}
        initial={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -20 }}>
        {loading ? <Skeleton className="inline-block h-5 w-40 align-middle" /> : (displayValue ?? value)}
      </motion.span>
    </AnimatePresence>
    {children ?? null}
  </Menu.Button>
);
