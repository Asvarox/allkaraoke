import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';

interface Props {
  unit?: string;
  value: number;
  onChange: (newValue: number) => void;
  step?: number;
  disabled?: boolean;
}

function NumericInput({ unit = '', value, onChange, step = 50, disabled = false, ...props }: Props) {
  return (
    <Container {...props}>
      <Button onClick={() => onChange(value - step)} disabled={disabled} data-test="numeric-input-down">
        -
      </Button>
      <Value>
        <strong data-test="numeric-input-value">{value}</strong>
        {unit}
      </Value>
      <Button onClick={() => onChange(value + step)} disabled={disabled} data-test="numeric-input-up">
        +
      </Button>
    </Container>
  );
}
export default NumericInput;

const Button = styled.button`
  background: black;
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
