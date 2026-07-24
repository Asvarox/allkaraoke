import { ComponentProps, ReactNode } from 'react';
import { twc } from 'react-twc';
import { twMerge } from 'tailwind-merge';

import { InputWrapper } from '~/modules/elements/akui/input-wrapper';
import { remoteControlHeight, remoteSelectorBackground } from '~/routes/remote-mic/components/remote-control-styles';

interface Props extends Omit<ComponentProps<typeof Container>, 'onChange' | 'className'> {
  /** Narrowed to a plain string (twc types it far wider) so it can be fed to `twMerge`. */
  className?: string;
  unit?: string;
  value: number;
  onChange: (newValue: number) => void;
  step?: number;
  disabled?: boolean;
  info?: ReactNode;
}

function NumericInput({
  unit = '',
  value,
  onChange,
  step = 50,
  disabled = false,
  className = '',
  info,
  ...props
}: Props) {
  return (
    <InputWrapper info={info}>
      <Container
        className={twMerge('shadow-focusable rounded-xl', remoteControlHeight, remoteSelectorBackground, className)}
        {...props}>
        <Button
          onClick={() => onChange(value - step)}
          disabled={disabled}
          data-test="numeric-input-down"
          className="rounded-l-md">
          -
        </Button>
        <div className="mobile:text-md flex-1 text-center text-lg">
          <strong data-test="numeric-input-value">{value}</strong>
          {unit}
        </div>
        <Button
          onClick={() => onChange(value + step)}
          disabled={disabled}
          data-test="numeric-input-up"
          className="rounded-r-md">
          +
        </Button>
      </Container>
    </InputWrapper>
  );
}
export default NumericInput;

// `h-full` so the steppers fill whatever height the container was given, rather than pinning it.
const Button = twc.button`typography h-full border-none bg-transparent px-5 py-1 text-xl disabled:opacity-50`;

// Full width and the shared control height/background, so a stepper lines up with the buttons,
// switchers and checkboxes it sits among on the remote.
const Container = twc.div`typography flex w-full items-center`;
