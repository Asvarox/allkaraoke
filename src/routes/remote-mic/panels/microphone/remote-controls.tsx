import { ArrowBack } from '@mui/icons-material';

import { Checkbox } from '~/modules/elements/akui/checkbox';
import { MenuButton } from '~/modules/elements/menu';
import { Switcher } from '~/modules/elements/switcher';
import { assertNever, ControlDescriptor } from '~/routes/keyboard-help/controls';

interface Props {
  control: ControlDescriptor;
  onActivate: (name: string) => void;
}

/**
 * Renders a single mirrored control on the remote mic using the SAME components the host screen
 * renders with (`MenuButton`/`Switcher`/`Checkbox`) — so the remote looks, truncates, and animates
 * exactly like the in-game menu, with nothing to keep in sync by hand.
 *
 * The exhaustive `switch` (with `assertNever`) guarantees at build time that every control type the
 * host can emit has a remote renderer.
 *
 * There is no "focused" state here on purpose: remote mics are touch-first, so a highlighted
 * "current" control would be misleading — every control is tapped directly.
 */
export default function RemoteControl({ control, onActivate }: Props) {
  const activate = () => onActivate(control.name);

  switch (control.type) {
    case 'button':
      return (
        <MenuButton
          size="small"
          onClick={activate}
          disabled={control.disabled}
          data-test={`control-${control.name}`}
          data-control-type="button">
          {control.variant === 'back' && <ArrowBack />}
          {control.label}
        </MenuButton>
      );
    case 'switch':
      return (
        <Switcher
          label={control.label}
          value={control.value}
          onClick={activate}
          disabled={control.disabled}
          data-test={`control-${control.name}`}
          data-control-type="switch"
        />
      );
    case 'checkbox':
      return (
        <Checkbox
          checked={control.checked}
          onClick={activate}
          disabled={control.disabled}
          data-test={`control-${control.name}`}
          data-control-type="checkbox">
          {control.label}
        </Checkbox>
      );
    default:
      return assertNever(control);
  }
}
