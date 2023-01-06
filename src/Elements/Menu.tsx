import styled from '@emotion/styled';
import styles from '../Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { Button } from './Button';
import { typography } from './cssMixins';

export const MenuButton = styled(Button)<{ focused?: boolean }>`
    margin: 0.5rem 0;
    height: 10rem;
    border: 0 solid black;

    :disabled {
        cursor: default;
        color: #989898;
        background-color: #212121;
        border-width: 0.3rem;
    }
`;

export const MenuContainer = styled.div`
    background: rgba(0, 0, 0, 0.5);
    padding: 1.5rem;
    width: 75rem;
    margin: 2rem auto 0 auto;
    font-size: 2.6rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;

    h1 {
        ${typography};
        margin: 0;
        text-align: center;
        font-size: 4rem;
        color: ${styles.colors.text.active};
    }

    h2 {
        ${typography};
        margin: 0;
        font-size: 2.9rem;
    }

    h3 {
        ${typography};
        margin: 0;
        font-size: 2.7rem;

        strong {
            color: ${styles.colors.text.active};
        }
    }

    h4 {
        ${typography};
        margin: 0;
        font-size: 2.2rem;
    }

    h5 {
        ${typography};
        margin: 0;
        font-size: 1.6rem;
    }

    hr {
        margin: 0.5rem 1rem;
        opacity: 0.25;
    }

    strong {
        color: ${styles.colors.text.active};
    }
`;
