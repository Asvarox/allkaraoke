import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'motion/react';
import { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { InputWrapper } from '~/modules/Elements/AKUI/InputWrapper';
import { typography } from '~/modules/Elements/cssMixins';
import styles from '~/modules/GameEngine/Drawing/styles';

interface Props extends PropsWithChildren, ComponentProps<typeof ConfigurationPosition> {
  focused?: boolean;
  disabled?: boolean;
  label: ReactNode;
  value: string | number | undefined | null;
  displayValue?: ReactNode;
  info?: ReactNode;
  onClick?: () => void;
}

export const Switcher = ({
  focused,
  disabled = false,
  label,
  value,
  displayValue,
  onClick,
  info,
  children,
  className = '',
  ...restProps
}: Props) => (
  <InputWrapper info={info}>
    <ConfigurationPosition
      data-focused={focused}
      onClick={onClick}
      data-disabled={disabled}
      {...restProps}
      className={`${className} shadow-focusable rounded-md`}>
      <span>{label ? <>{label}:</> : ''}</span>{' '}
      <AnimatePresence>
        <ConfigValue
          key={value ?? ''}
          initial={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -20 }}>
          {displayValue ?? value}
        </ConfigValue>
      </AnimatePresence>
      {children ?? null}
    </ConfigurationPosition>
  </InputWrapper>
);

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
  position: relative;
  overflow: hidden;

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

const ConfigValue = styled(motion.span)`
  color: ${styles.colors.text.active};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding-left: 1rem;
  position: absolute;
  right: 1rem;
`;
