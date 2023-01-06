import styled from '@emotion/styled';
import { focusable, typography } from 'Elements/cssMixins';
import { REGULAR_ALPHA_CHARS } from 'hooks/useKeyboard';
import {
    DetailedHTMLProps,
    ForwardedRef,
    forwardRef,
    InputHTMLAttributes,
    ReactNode,
    useImperativeHandle,
    useRef,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';

interface Props extends Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'onChange'> {
    focused: boolean;
    label: ReactNode;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export const Input = forwardRef(
    (
        { focused, label, value, onChange, disabled, className, ...restProps }: Props,
        forwardedRef: ForwardedRef<HTMLInputElement>,
    ) => {
        const inputRef = useRef<HTMLInputElement>(null);
        useImperativeHandle(forwardedRef, () => inputRef.current!);

        useHotkeys(REGULAR_ALPHA_CHARS, () => inputRef.current?.focus(), { enabled: focused });

        return (
            <Container focused={focused} className={className}>
                <Label>{label}</Label>
                <StyledInput
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    {...restProps}
                    disabled={disabled}
                    ref={inputRef}
                />
            </Container>
        );
    },
);

const Container = styled.div<{ focused: boolean }>`
    background: black;
    caret: underscore;
    ${focusable};
    ${typography};
    width: auto;
    display: flex;
    cursor: text;
    padding: 0.25em;
    align-items: center;
`;

const Label = styled.span`
    padding-right: 0.5em;
    white-space: nowrap;
    width: auto;
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
