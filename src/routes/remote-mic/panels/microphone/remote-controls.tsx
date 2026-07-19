import { ArrowBack } from '@mui/icons-material';

import { Checkbox } from '~/modules/elements/akui/checkbox';
import { MenuButton } from '~/modules/elements/menu';
import { Switcher } from '~/modules/elements/switcher';
import { assertNever, ControlDescriptor } from '~/routes/keyboard-help/controls';
import { remoteButtonIcons } from '~/routes/keyboard-help/remote-button-icons';

interface Props {
  control: ControlDescriptor;
  onActivate: (name: string) => void;
}

/**
 * Slightly darker background for the remote-mic keyboard's switch/checkbox controls, so they stand
 * out a touch more against the panel. Buttons keep the standard background — they already read as
 * distinct controls via their icon/label layout, so the extra contrast is only needed on
 * `Switcher`/`Checkbox`, which sit flush with the panel otherwise.
 *
 * `disabled:bg-gray-500!` re-asserts the base button's disabled colour: our darker background is a
 * plain (higher-priority) class that `twMerge` would otherwise let win even for disabled controls,
 * washing out the greyed-out look.
 */
const remoteSelectorBackground = 'bg-black/70! disabled:bg-gray-500!';

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
    case 'button': {
      const isBack = control.variant === 'back';
      // Back buttons keep a leading arrow and no trailing icon. Every other button gets a trailing
      // icon: `'forward'` by default, a named glyph when the host overrides it, or none when `null`.
      const RightIcon = isBack || control.icon === null ? undefined : remoteButtonIcons[control.icon ?? 'forward'];
      return (
        <MenuButton
          size="small"
          onClick={activate}
          disabled={control.disabled}
          leftIcon={isBack ? <ArrowBack /> : undefined}
          rightIcon={RightIcon ? <RightIcon /> : undefined}
          data-test={`control-${control.name}`}
          data-control-type="button">
          {control.label}
        </MenuButton>
      );
    }
    case 'switch':
      return (
        <Switcher
          label={control.label}
          value={control.value}
          onClick={activate}
          disabled={control.disabled}
          className={remoteSelectorBackground}
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
          className={remoteSelectorBackground}
          data-test={`control-${control.name}`}
          data-control-type="checkbox">
          {control.label}
        </Checkbox>
      );
    default:
      return assertNever(control);
  }
}
