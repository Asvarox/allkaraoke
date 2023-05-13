import styled from '@emotion/styled';
import { focusable, typography } from 'Elements/cssMixins';
import { PropsWithChildren, ReactNode } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { ValuesType } from 'utility-types';

interface Props extends PropsWithChildren {
    focused: boolean;
    label: ReactNode;
    value: ReactNode;
    onClick?: () => void;
}

export function nextIndex<T extends readonly any[]>(values: T, current: number, direction: 1 | -1 = 1): number {
    return direction === 1 ? (current + 1) % values.length : (current + values.length - 1) % values.length;
}
export function nextValueIndex<T extends readonly any[]>(
    values: T,
    current: ValuesType<T>,
    direction: 1 | -1 = 1,
): number {
    return nextIndex(values, values.indexOf(current), direction);
}
export function nextValue<T extends readonly any[]>(
    values: T,
    current: ValuesType<T>,
    direction: 1 | -1 = 1,
): ValuesType<T> {
    return values[nextValueIndex(values, current, direction)];
}

export const Switcher = ({ focused, label, value, onClick, children, ...restProps }: Props) => (
    <ConfigurationPosition focused={focused} onClick={onClick} {...restProps}>
        <span>{label ? <>{label}:</> : ''}</span> <ConfigValue>{value}</ConfigValue>
        {children ?? null}
    </ConfigurationPosition>
);

const ConfigurationPosition = styled.span<{ focused: boolean; expanded?: boolean }>`
    background: rgba(0, 0, 0, 0.7);

    width: auto;
    ${typography};

    text-align: right;
    font-size: ${({ expanded }) => (expanded ? '6rem' : '2.7rem')};
    cursor: pointer;
    padding: 0.65rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    ${focusable}
`;

const ConfigValue = styled.span`
    color: ${styles.colors.text.active};
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    padding-left: 1rem;
`;
