import styled from '@emotion/styled';
import { focusable, typography } from 'Elements/cssMixins';
import { ForwardedRef, forwardRef, ReactNode } from 'react';
import styles from '../Singing/GameOverlay/Drawing/styles';

interface Props {
    focused: boolean;
    label: ReactNode;
    value: string;
    onChange: (value: string) => void;
}

export const Input = forwardRef(
    ({ focused, label, value, onChange, ...restProps }: Props, ref: ForwardedRef<HTMLInputElement>) => (
        <Container focused={focused} {...restProps}>
            <Label>{label}</Label>
            <StyledInput value={value} onChange={(e) => onChange(e.target.value)} {...restProps} ref={ref} />
        </Container>
    ),
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
    padding-right: 15px;
`;

const StyledInput = styled.input`
    padding: 0;
    border: 0;
    font-size: 100%;
    background: transparent;
    caret: underscore;
    ${typography};
    color: ${styles.colors.text.active};
    width: 100%;
    &:focus {
        outline: none;
    }
`;
