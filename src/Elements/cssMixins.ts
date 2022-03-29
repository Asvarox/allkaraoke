import { css } from 'styled-components';
import styles from '../Scenes/Game/Singing/Drawing/styles';

export const focusable = css<{ focused?: boolean }>`
    ${(props) => !!props.focused && focused}
`;

export const focused = css`
    @keyframes focus {
        100% {
            box-shadow: inset 0px 0px 2px 2px ${styles.colors.text.active};
        }
        50% {
            box-shadow: inset 0px 0px 4px 4px ${styles.colors.text.active};
        }
        0% {
            box-shadow: inset 0px 0px 2px 2px ${styles.colors.text.active};
        }
    }
    animation: focus 1000ms ease-in-out infinite both;
`;

export const typography = css`
    font-weight: bold;
    -webkit-text-stroke: 0.035em black;
    color: white;
`;
