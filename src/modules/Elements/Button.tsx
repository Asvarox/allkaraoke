import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { focused, typography } from 'modules/Elements/cssMixins';
import styles from 'modules/GameEngine/Drawing/styles';
import isE2E from 'modules/utils/isE2E';

const buttonCss = (focused?: boolean) => css`
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

  ${typography};

  pointer-events: auto;
  ${focused && buttonFocused};
  box-sizing: border-box;

  transition: 300ms;
`;

const buttonNotDisabledCss = css`
  :hover {
    ${focused};
  }

  :active {
    background: ${styles.colors.text.active};
  }
`;

export const LinkButton = styled.a<{ focused?: boolean; disabled?: boolean }>`
  ${(props) => buttonCss(props.focused)};

  && {
    // increases specificity to override global styles
    color: white;
    text-decoration: none;
  }

  ${(props) => !props.disabled && buttonNotDisabledCss};
`;

export const Button = styled.button<{ focused?: boolean }>`
  ${(props) => buttonCss(props.focused)};

  :not(:disabled) {
    ${buttonNotDisabledCss};
  }
`;
// Disable for E2E as they wait for animation to finish (and since it's infinite they timeout)
const buttonFocusedAnimation = isE2E()
  ? css``
  : css`
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
    `;

export const buttonFocused = css`
  transform: scale(1.05);
  background: ${styles.colors.text.active};

  ${buttonFocusedAnimation};
`;
