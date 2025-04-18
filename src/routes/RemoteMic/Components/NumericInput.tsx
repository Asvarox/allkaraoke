import styled from '@emotion/styled';
import { typography } from 'modules/Elements/cssMixins';
import { ComponentProps } from 'react';

interface Props extends Omit<ComponentProps<typeof Container>, 'onChange'> {
  unit?: string;
  value: number;
  onChange: (newValue: number) => void;
  step?: number;
  disabled?: boolean;
}

function NumericInput({ unit = '', value, onChange, step = 50, disabled = false, className = '', ...props }: Props) {
  return (
    <Container className={`${className} shadow-focusable rounded-md`} {...props}>
      <Button
        onClick={() => onChange(value - step)}
        disabled={disabled}
        data-test="numeric-input-down"
        className="rounded-l-md">
        -
      </Button>
      <Value>
        <strong data-test="numeric-input-value">{value}</strong>
        {unit}
      </Value>
      <Button
        onClick={() => onChange(value + step)}
        disabled={disabled}
        data-test="numeric-input-up"
        className="rounded-r-md">
        +
      </Button>
    </Container>
  );
}
export default NumericInput;

const Button = styled.button`
  padding: 0.5rem 2rem;
  border: none;
  font-size: 3rem;
  ${typography};
  :disabled {
    opacity: 0.5;
  }
`;

const Value = styled.div`
  flex: 1;
  text-align: center;
`;
const Container = styled.div`
  ${typography};
  display: flex;
  align-items: center;
  justify-self: center;
  background: black;
`;
