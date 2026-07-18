import { ComponentProps, ReactNode } from 'react';
import { Checkbox } from '~/modules/elements/akui/checkbox';
import { MenuButton } from '~/modules/elements/menu';
import { Switcher } from '~/modules/elements/switcher';
import { RegisterFunc, useRegister } from '~/modules/hooks/use-keyboard-nav';
import { ButtonVariant } from '~/routes/keyboard-help/controls';

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

/** Register from the explicit `nav` prop when given, otherwise from the KeyboardNavProvider. */
function useResolvedRegister(nav?: RegisterFunc): RegisterFunc {
  const contextRegister = useRegister(true);
  return nav ?? contextRegister;
}

interface NavSwitcherProps extends Omit<ComponentProps<typeof Switcher>, 'value' | 'label' | 'onClick'> {
  nav?: RegisterFunc;
  name: string;
  label: string;
  value: string | number;
  onClick: () => void;
  isDefault?: boolean;
  disabled?: boolean;
}

export function NavSwitcher({
  nav,
  name,
  label,
  value,
  onClick,
  isDefault = false,
  disabled = false,
  ...rest
}: NavSwitcherProps) {
  const register = useResolvedRegister(nav);
  const props = register(name, onClick, label, isDefault, {
    disabled,
    control: { type: 'switch', label, value: String(value) },
  });
  return <Switcher {...rest} {...props} label={label} value={value} />;
}

interface NavCheckboxProps extends Omit<ComponentProps<typeof Checkbox>, 'checked' | 'onClick'> {
  nav?: RegisterFunc;
  name: string;
  label: string;
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
    control: { type: 'checkbox', label, checked },
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
  /** Descriptor label sent to the phone. Defaults to `children` when it is a plain string. */
  label?: string;
  /** Marks this button's semantic role, e.g. `'back'` shows a leading back arrow on the remote. */
  variant?: ButtonVariant;
  onClick: () => void;
  isDefault?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

export function NavButton({
  nav,
  name,
  label,
  variant,
  onClick,
  isDefault = false,
  disabled = false,
  children,
  ...rest
}: NavButtonProps) {
  const register = useResolvedRegister(nav);
  const resolvedLabel = label ?? (typeof children === 'string' ? children : '');
  const props = register(name, onClick, resolvedLabel, isDefault, {
    disabled,
    control: { type: 'button', label: resolvedLabel, variant },
  });
  return (
    <MenuButton {...rest} {...props}>
      {children}
    </MenuButton>
  );
}
