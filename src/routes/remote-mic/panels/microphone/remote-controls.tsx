import { ArrowBack } from '@mui/icons-material';
import { useEffect, useState } from 'react';

import { Checkbox } from '~/modules/elements/akui/checkbox';
import { Input } from '~/modules/elements/input';
import { MenuButton } from '~/modules/elements/menu';
import { Switcher } from '~/modules/elements/switcher';
import useDebounce from '~/modules/hooks/use-debounce';
import { serverRpc } from '~/modules/remote-mic/network/client';
import { assertNever, ControlDescriptor } from '~/routes/keyboard-help/controls';
import { remoteButtonIcons } from '~/routes/keyboard-help/remote-button-icons';
import NumericInput from '~/routes/remote-mic/components/numeric-input';
import { remoteSelectorBackground } from '~/routes/remote-mic/components/remote-control-styles';

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
    case 'text':
      return <TextControl control={control} />;
    case 'input-lag':
      return <InputLagControl control={control} />;
    default:
      return assertNever(control);
  }
}

/**
 * A mirrored free-form text field. Edits are kept locally so typing stays responsive, then streamed
 * back to the host (debounced) via `setControlValue`, which routes them to the on-screen input's
 * `onChange`. The phone is the editor here, so it doesn't echo the host value back onto itself.
 */
function TextControl({ control }: { control: Extract<ControlDescriptor, { type: 'text' }> }) {
  const [value, setValue] = useState(control.value);
  const debouncedValue = useDebounce(value, 150);

  useEffect(() => {
    if (debouncedValue !== control.value) void serverRpc.input.setControlValue(control.name, debouncedValue);
    // Only re-send when the locally-edited value settles; `control.value` is the host's echo and must
    // not itself trigger a send (that would loop).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue, control.name]);

  return (
    <Input
      focused={false}
      label={control.label}
      placeholder={control.placeholder}
      value={value}
      onChange={setValue}
      disabled={control.disabled}
      className={remoteSelectorBackground}
      data-test={`control-${control.name}`}
      data-control-type="text"
    />
  );
}

/**
 * The game's global input-lag stepper, mirrored to the phone. Wired straight to
 * `serverRpc.settings.setInputLag` — the same RPC the remote settings screen uses — so it behaves
 * identically wherever it appears. Local optimistic state keeps the stepper snappy while the host
 * round-trips a fresh descriptor value.
 */
function InputLagControl({ control }: { control: Extract<ControlDescriptor, { type: 'input-lag' }> }) {
  const [value, setValue] = useState(control.value);
  useEffect(() => setValue(control.value), [control.value]);

  const change = (newValue: number) => {
    setValue(newValue);
    void serverRpc.settings.setInputLag(newValue);
  };

  return (
    <div data-test={`control-${control.name}`} data-control-type="input-lag">
      <NumericInput value={value} onChange={change} disabled={control.disabled} unit="ms" data-test="game-input-lag" />
    </div>
  );
}
