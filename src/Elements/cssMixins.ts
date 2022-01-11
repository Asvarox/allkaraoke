import { css } from "styled-components";
import styles from "../Scenes/Game/Singing/Drawing/styles";

export const focusable = css<{ focused: boolean }>`
    ${({ focused }) => focused && `
        opacity: 1;
        box-shadow: inset 0px 0px 3px 3px ${styles.colors.text.active};
    `}
`