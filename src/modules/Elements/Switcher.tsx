import styled from '@emotion/styled';
import { typography } from 'modules/Elements/cssMixins';
import styles from 'modules/GameEngine/Drawing/styles';
import { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { ValuesType } from 'utility-types';

interface Props extends PropsWithChildren, ComponentProps<typeof ConfigurationPosition> {
  focused?: boolean;
  disabled?: boolean;
  label: ReactNode;
  value: ReactNode;
  info?: ReactNode;
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

export const Switcher = ({ focused, disabled = false, label, value, onClick, info, children, ...restProps }: Props) => (
  <Container>
    <ConfigurationPosition data-focused={focused} onClick={onClick} data-disabled={disabled} {...restProps}>
      <span>{label ? <>{label}:</> : ''}</span> <ConfigValue>{value}</ConfigValue>
      {children ?? null}
    </ConfigurationPosition>
    {info && <InfoText>{info}</InfoText>}
  </Container>
);

const Container = styled.div``;

export const InfoText = styled.div`
  ${typography};
  font-size: 2rem;
  padding: 1rem 0.5rem 0;
  text-align: justify;
`;

const ConfigurationPosition = styled.span<{ disabled?: boolean }>`
  background: rgba(0, 0, 0, 0.7);

  width: auto;
  ${typography};

  text-align: right;
  font-size: 2.7rem;
  cursor: pointer;
  padding: 0.65rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  &[data-expanded='true'] {
    font-size: 6rem;
  }

  &[data-disabled='true'] {
    cursor: default;
  }

  &[data-focused='true'][data-disabled='false'] {
    animation: focusAnimation 1000ms ease-in-out infinite both;
  }
  &:hover {
    animation: focusAnimation 1000ms ease-in-out infinite both;
  }
`;

const ConfigValue = styled.span`
  color: ${styles.colors.text.active};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding-left: 1rem;
`;
