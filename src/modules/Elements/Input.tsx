import styled from '@emotion/styled';
import { InfoText } from 'modules/Elements/Switcher';
import { typography } from 'modules/Elements/cssMixins';
import styles from 'modules/GameEngine/Drawing/styles';
import { REGULAR_ALPHA_CHARS } from 'modules/hooks/useKeyboard';
import { DetailedHTMLProps, InputHTMLAttributes, ReactNode, useImperativeHandle, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

interface Props extends Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'onChange'> {
  focused: boolean;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  adornment?: ReactNode;
  info?: ReactNode;
}

export const Input = ({
  focused,
  label,
  value,
  onChange,
  disabled,
  className,
  adornment,
  info,
  ref,
  ...restProps
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current!);

  useHotkeys(REGULAR_ALPHA_CHARS, () => inputRef.current?.focus(), { enabled: focused });

  return (
    <div>
      <Container
        data-focused={focused}
        className={className}
        onClick={() => {
          inputRef.current?.focus();
        }}>
        <Label>{label}</Label>
        <StyledInput
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...restProps}
          disabled={disabled}
          ref={inputRef}
        />
        {adornment && <Adornment>{adornment}</Adornment>}
      </Container>
      {info && <InfoText>{info}</InfoText>}
    </div>
  );
};

const Adornment = styled.span``;

const Container = styled.div`
  background: black;
  caret: underscore;
  ${typography};
  width: auto;
  display: flex;
  cursor: text;
  padding: 0.25em;
  align-items: center;

  &[data-focused='true'] {
    animation: focusAnimation 1000ms ease-in-out infinite both;
  }
  &:hover {
    animation: focusAnimation 1000ms ease-in-out infinite both;
  }
`;

const Label = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-right: 0.5em;
  white-space: nowrap;
  width: auto;
  pointer-events: none;

  svg {
    font-size: 1em;
  }
`;

const StyledInput = styled.input`
  padding: 0;
  border: 0;
  background: transparent;
  caret: underscore;
  ${typography};
  color: ${styles.colors.text.active};
  width: 100%;
  font-size: 1em;

  &:focus {
    outline: none;
  }
`;
