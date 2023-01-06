import { css, keyframes } from '@emotion/react';
import styles from '../Scenes/Game/Singing/GameOverlay/Drawing/styles';

export const focusable = (props: { focused?: boolean }) => css`
    ${!!props.focused && focused};

    :hover {
        ${focused};
    }
`;

const focusAnimation = keyframes`
  100% {
    box-shadow: inset 0px 0px 0px 2px ${styles.colors.text.active};
  }
  50% {
    box-shadow: inset 0px 0px 0px 4px ${styles.colors.text.active};
  }
  0% {
    box-shadow: inset 0px 0px 0px 2px ${styles.colors.text.active};
  }
`;

export const focused = css`
    animation: ${focusAnimation} 1000ms ease-in-out infinite both;
`;

export const typography = css`
    font-weight: bold;
    -webkit-text-stroke: thin black;
    color: white;
`;
