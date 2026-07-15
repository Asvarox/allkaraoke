import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { twc, TwcComponentProps } from 'react-twc';

import { assertNever, ControlDescriptor } from '~/routes/keyboard-help/controls';

interface Props {
  control: ControlDescriptor;
  onActivate: (name: string) => void;
}

/**
 * Renders a single mirrored control on the remote mic. The exhaustive `switch` (with `assertNever`)
 * guarantees at build time that every control type the host can emit has a remote renderer.
 *
 * There is no "focused" state here on purpose: remote mics are touch-first, so a highlighted
 * "current" control would be misleading — every control is tapped directly.
 */
export default function RemoteControl({ control, onActivate }: Props) {
  const activate = () => onActivate(control.name);

  switch (control.type) {
    case 'button':
      return (
        <ControlButton
          onClick={activate}
          disabled={control.disabled}
          data-test={`control-${control.name}`}
          data-control-type="button">
          <Label>{control.label}</Label>
        </ControlButton>
      );
    case 'switch':
      return (
        <ControlButton
          onClick={activate}
          disabled={control.disabled}
          data-test={`control-${control.name}`}
          data-control-type="switch">
          <Label>{control.label}</Label>
          <Value data-test={`control-${control.name}-value`}>{control.value}</Value>
        </ControlButton>
      );
    case 'checkbox':
      return (
        <ControlButton
          onClick={activate}
          disabled={control.disabled}
          data-checked={control.checked}
          data-test={`control-${control.name}`}
          data-control-type="checkbox">
          {control.checked ? <CheckBox className="h-7! w-7!" /> : <CheckBoxOutlineBlank className="h-7! w-7!" />}
          <Label>{control.label}</Label>
        </ControlButton>
      );
    default:
      return assertNever(control);
  }
}

const ControlButton = twc.button<TwcComponentProps<'button'>>((props) => [
  'typography flex w-full items-center gap-3 rounded-lg border-0 bg-black/45 px-4 py-3.5 text-left text-lg text-white transition-colors',
  props.disabled ? 'pointer-events-none opacity-40' : 'active:bg-active/60 cursor-pointer',
]);

const Label = twc.span`flex-1 truncate font-bold`;

const Value = twc.span`text-active max-w-[45%] truncate text-right font-bold`;
