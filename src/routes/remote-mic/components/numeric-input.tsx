import { ComponentProps, ReactNode } from 'react';
import { twc } from 'react-twc';
import { InputWrapper } from '~/modules/elements/akui/input-wrapper';

interface Props extends Omit<ComponentProps<typeof Container>, 'onChange'> {
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
      <Container className={`${className} shadow-focusable rounded-md`} {...props}>
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

const Button = twc.button`typography h-14 border-none px-5 py-1 text-xl disabled:opacity-50`;

const Container = twc.div`typography flex items-center justify-self-center bg-black`;
