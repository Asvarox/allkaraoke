import { ComponentProps, ReactNode } from 'react';
import { twc } from 'react-twc';
import { twMerge } from 'tailwind-merge';

import { Icon } from '~/modules/elements/akui/icon';
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
          <Icon icon="ic:baseline-remove" size={6} />
        </Button>
        <div className="mobile:text-md min-w-0 flex-1 text-center text-lg">
          <strong data-test="numeric-input-value">{value}</strong>
          {unit}
        </div>
        <Button
          onClick={() => onChange(value + step)}
          disabled={disabled}
          data-test="numeric-input-up"
          className="rounded-r-md">
          <Icon icon="ic:baseline-add" size={6} />
        </Button>
      </Container>
    </InputWrapper>
  );
}
export default NumericInput;

/**
 * The -/+ steppers. Real icons rather than "-"/"+" text: the two characters have different advance
 * widths (which made the buttons different widths, so the signs sat at different insets from each
 * edge) and different ink heights (the hyphen rides much lower than the plus), so as text they could
 * never line up. Matching 24px glyphs in equal, flex-centred boxes are symmetric by construction.
 *
 * `h-full` so they fill whatever height the container was given rather than pinning it; the icons
 * are sized explicitly via `size={6}` (24px) rather than a CSS class — matches the icon size AKUI
 * uses on its `small` buttons, which is what they sit beside here.
 */
const Button = twc.button`typography flex h-full w-14 shrink-0 items-center justify-center border-none bg-transparent disabled:opacity-50`;

// Full width and the shared control height/background, so a stepper lines up with the buttons,
// switchers and checkboxes it sits among on the remote.
const Container = twc.div`typography flex w-full items-center`;
