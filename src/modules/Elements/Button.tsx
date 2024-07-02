import { css } from '@linaria/core';
import styles from 'modules/GameEngine/Drawing/styles';

import { typography } from 'modules/Elements/cssMixins';
import isE2E from 'modules/utils/isE2E';
import { ButtonHTMLAttributes, DetailedHTMLProps, HTMLProps } from 'react';

const buttonCss = css`
  padding: 0.1rem 0.3rem;
  font-size: 2.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  border: 0;
  background-color: rgba(0, 0, 0, 0.75);
  text-transform: uppercase;
  letter-spacing: 0.2rem;
  pointer-events: auto;
  box-sizing: border-box;
  transition: 300ms;
  ${typography},
`;

export const buttonFocusedAnimated = css`
  @keyframes button-focus-loop {
    0%,
    100% {
      transform: scale(1.045);
    }
    50% {
      transform: scale(1.055);
    }
  }
  animation: button-focus-loop 600ms ease-in-out infinite both;
  transform: scale(1.05);

  background: ${styles.colors.text.active};
`;
export const buttonFocusedStatic = css`
  transform: scale(1.05);

  background: ${styles.colors.text.active};
`;

export const buttonFocused = isE2E() ? buttonFocusedStatic : buttonFocusedAnimated;

export const buttonFocusedAnim = {
  animation: 'focusAnimation 1000ms ease-in-out infinite both',
};

const buttonNotDisabledCss = css`
  &:hover {
    ${buttonFocusedAnim};
  }
  &&&:active {
    background: ${styles.colors.text.active};
  }
`;
export const LinkButtonCss = css`
  // increases specificity to override global styles
  && {
    color: white;
    text-decoration: none;
  }
`;

export const ButtonCss = css`
  &:not(:disabled) {
    ${buttonNotDisabledCss};
  }
`;

export const LinkButton = ({
  focused,
  disabled,
  className,
  ...props
}: HTMLProps<HTMLAnchorElement> & { focused?: boolean; disabled?: boolean }) => {
  return (
    <a
      {...props}
      className={`${buttonCss} ${LinkButtonCss} ${focused ? buttonFocused : ''} ${!disabled ? buttonNotDisabledCss : ''} ${className}`}
    />
  );
};

export const Button = ({
  focused,
  className,
  disabled,
  ...props
}: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  focused?: boolean;
  disabled?: boolean;
}) => {
  return (
    <button
      {...props}
      className={`${buttonCss} ${ButtonCss} ${!disabled ? buttonNotDisabledCss : ''} ${focused ? buttonFocused : ''}  ${className}`}
    />
  );
};
