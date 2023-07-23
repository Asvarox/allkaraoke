import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { focused, typography } from 'Elements/cssMixins';
import isE2E from 'utils/isE2E';
import styles from '../Scenes/Game/Singing/GameOverlay/Drawing/styles';

export const Button = styled.button<{ focused?: boolean }>`
    padding: 0.1rem 0.3rem;
    font-size: 2.6rem;
    display: block;
    text-align: center;
    cursor: pointer;
    border: 0;

    background-color: rgba(0, 0, 0, 0.75);
    text-transform: uppercase;
    letter-spacing: 0.2rem;

    ${typography};

    pointer-events: auto;
    ${(props) => props.focused && buttonFocused};
    box-sizing: border-box;

    transition: 300ms;

    :not(:disabled) {
        :hover {
            ${focused};
        }
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
