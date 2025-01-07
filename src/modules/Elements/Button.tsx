import { css } from '@emotion/react';
import styles from 'modules/GameEngine/Drawing/styles';

import { Button as AKUIButton } from 'modules/Elements/AKUI/Button';
import isE2E from 'modules/utils/isE2E';

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

export const Button = AKUIButton;
