import { ComponentProps, ReactNode } from 'react';

import { Checkbox } from '~/modules/elements/akui/checkbox';
import { MenuButton } from '~/modules/elements/menu';
import { Switcher } from '~/modules/elements/switcher';
import { RegisterFunc, useRegister } from '~/modules/hooks/use-keyboard-nav';
import { ButtonVariant, ControlInput, RemoteButtonIcon } from '~/routes/keyboard-help/controls';

/**
 * `Nav.*` — single-source-of-truth wrappers that opt a screen into the "mirrored" remote-mic
 * keyboard. Each wrapper takes the domain props once and feeds BOTH the on-screen render and the
 * control descriptor sent to the phone from the same values, so they cannot drift.
 *
 * `register` is taken from the nearest <KeyboardNavProvider> by default; pass `nav` to override it.
 *
 * A screen becomes mirrored only when EVERY navigable element uses one of these (all-or-nothing,
 * enforced in useKeyboardNav). Screens out of scope (editors, admin) keep the raw components and
 * fall back to the classic arrow keyboard.
 */

interface NavRemoteControlProps {
  nav?: RegisterFunc;
  name: string;
  /** The descriptor sent to the phone — same shape every other `Nav.*` wrapper derives internally. */
  control: ControlInput;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * A control that exists ONLY on the remote mic — it renders nothing on screen.
 *
 * Use it when the phone needs an affordance the screen legitimately doesn't show, the canonical case
 * being "back": mirrored screens must supply their own back control (the phone injects none), but a
 * screen reached as an overlay/dialog often has no visible back button of its own, only the
 * Backspace/Escape handler. Placement in JSX decides where it lands in the mirrored list, so put a
 * back control last.
 *
 * Being off-screen, it takes no part in arrow navigation and can never be focused — tapping it on
 * the phone fires `onClick` directly, exactly like the keyboard handler would.
 *
 * Reach for this sparingly: a control the TV can't reach is invisible to anyone without a phone.
 * Always back it with a real key handler (e.g. `onBackspace`) so both inputs stay usable.
 */
export function NavRemoteControl({ nav, name, control, onClick, disabled = false }: NavRemoteControlProps) {
  const register = useResolvedRegister(nav);
  register(name, onClick, control.label, false, { disabled, control, remoteOnly: true });
  return null;
}

/** Register from the explicit `nav` prop when given, otherwise from the KeyboardNavProvider. */
function useResolvedRegister(nav?: RegisterFunc): RegisterFunc {
  const contextRegister = useRegister(true);
  return nav ?? contextRegister;
}

interface NavSwitcherProps extends Omit<ComponentProps<typeof Switcher>, 'value' | 'label' | 'onClick'> {
  nav?: RegisterFunc;
  name: string;
  label: string;
  /** Shorter label to show on the remote instead of `label`, e.g. "Camera mode" for "Enable camera mode". */
  remoteLabel?: string;
  value: string | number;
  onClick: () => void;
  isDefault?: boolean;
  disabled?: boolean;
}

export function NavSwitcher({
  nav,
  name,
  label,
  remoteLabel,
  value,
  onClick,
  isDefault = false,
  disabled = false,
  ...rest
}: NavSwitcherProps) {
  const register = useResolvedRegister(nav);
  const props = register(name, onClick, label, isDefault, {
    disabled,
    control: { type: 'switch', label: remoteLabel ?? label, value: String(value) },
  });
  return <Switcher {...rest} {...props} label={label} value={value} />;
}

interface NavCheckboxProps extends Omit<ComponentProps<typeof Checkbox>, 'checked' | 'onClick'> {
  nav?: RegisterFunc;
  name: string;
  label: string;
  /** Shorter label to show on the remote instead of `label`. */
  remoteLabel?: string;
  checked: boolean;
  onClick: () => void;
  isDefault?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}

export function NavCheckbox({
  nav,
  name,
  label,
  remoteLabel,
  checked,
  onClick,
  isDefault = false,
  disabled = false,
  children,
  ...rest
}: NavCheckboxProps) {
  const register = useResolvedRegister(nav);
  const props = register(name, onClick, label, isDefault, {
    disabled,
    control: { type: 'checkbox', label: remoteLabel ?? label, checked },
  });
  return (
    <Checkbox {...rest} {...props} checked={checked}>
      {children ?? label}
    </Checkbox>
  );
}

interface NavButtonProps extends Omit<ComponentProps<typeof MenuButton>, 'onClick'> {
  nav?: RegisterFunc;
  name: string;
  /** Shorter label to show on the remote. Defaults to `children` when it is a plain string. */
  remoteLabel?: string;
  /** Marks this button's semantic role, e.g. `'back'` shows a leading back arrow on the remote. */
  variant?: ButtonVariant;
  /**
   * Trailing icon shown on the remote. Defaults to a forward arrow; pass another known name to
   * override it (e.g. `'play'`), or `null` to show no trailing icon. Ignored for `variant="back"`.
   */
  remoteIcon?: RemoteButtonIcon | null;
  onClick: () => void;
  isDefault?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

export function NavButton({
  nav,
  name,
  remoteLabel,
  variant,
  remoteIcon,
  onClick,
  isDefault = false,
  disabled = false,
  children,
  ...rest
}: NavButtonProps) {
  const register = useResolvedRegister(nav);
  const resolvedLabel = remoteLabel ?? (typeof children === 'string' ? children : '');
  const props = register(name, onClick, resolvedLabel, isDefault, {
    disabled,
    control: { type: 'button', label: resolvedLabel, variant, icon: remoteIcon },
  });
  return (
    <MenuButton {...rest} {...props}>
      {children}
    </MenuButton>
  );
}
