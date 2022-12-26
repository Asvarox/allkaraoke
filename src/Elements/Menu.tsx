import styled from '@emotion/styled';
import styles from '../Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { Button } from './Button';
import { typography } from './cssMixins';

export const MenuButton = styled(Button)<{ focused?: boolean }>`
    margin: 5px 0;
    height: 100px;
    border: 0 solid black;

    :disabled {
        cursor: default;
        color: #989898;
        background-color: #212121;
        border-width: 3px;
    }
`;

export const MenuContainer = styled.div`
    background: rgba(0, 0, 0, 0.5);
    padding: 15px;
    width: 750px;
    margin: 20px auto 0 auto;
    font-size: 26px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    h1 {
        ${typography};
        margin: 0;
        text-align: center;
        font-size: 1.5em;
        color: ${styles.colors.text.active};
    }

    h2 {
        ${typography};
        margin: 0;
        font-size: 1.15em;
    }

    h3 {
        ${typography};
        margin: 0;
        font-size: 1.05em;

        strong {
            color: ${styles.colors.text.active};
        }
    }

    h4 {
        ${typography};
        margin: 0;
        font-size: 0.85em;
    }

    hr {
        margin: 5px 10px;
        opacity: 0.25;
    }

    strong {
        color: ${styles.colors.text.active};
    }
`;
