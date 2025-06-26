import styled from '@emotion/styled';
import { InputWrapper } from 'modules/Elements/AKUI/InputWrapper';
import { typography } from 'modules/Elements/cssMixins';
import styles from 'modules/GameEngine/Drawing/styles';
import { REGULAR_ALPHA_CHARS } from 'modules/hooks/useKeyboard';
import { AnimatePresence, motion } from 'motion/react';
import { DetailedHTMLProps, InputHTMLAttributes, ReactNode, useImperativeHandle, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

interface InputRef {
  element: HTMLInputElement | null;
  triggerValidationError: (message: string) => void;
}
interface Props
  extends Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'onChange' | 'ref'> {
  focused: boolean;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  adornment?: ReactNode;
  info?: ReactNode;
  ref?: React.Ref<InputRef>;
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
  const [validationError, setValidationError] = useState<null | string>(null);
  const validationErrorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => ({
    element: inputRef.current,
    triggerValidationError: (message: string) => {
      if (validationErrorTimeoutRef.current) {
        clearTimeout(validationErrorTimeoutRef.current);
      }
      setValidationError(message);
      validationErrorTimeoutRef.current = setTimeout(() => {
        setValidationError(null);
      }, 4000);
    },
  }));

  useHotkeys(REGULAR_ALPHA_CHARS, () => inputRef.current?.focus(), { enabled: focused });

  return (
    <InputWrapper info={info}>
      <Container
        data-focused={focused}
        className={`${className} relative rounded-md ${validationError ? 'starting:outline-text-error/0 outline-text-error/100 outline outline-offset-2 duration-300' : ''}`}
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
        <AnimatePresence>
          {validationError && (
            <motion.div
              exit={{ opacity: 0, right: '20%' }}
              className="bg-text-error/75 absolute right-0 bottom-[-1.5rem] rounded-md p-1 text-sm text-white opacity-100 duration-300 starting:right-10 starting:opacity-0">
              {validationError}️
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </InputWrapper>
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
