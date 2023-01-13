import { css } from '@emotion/react';
import { typography } from 'Elements/cssMixins';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';

export default css`
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

    a {
        color: ${styles.colors.text.active};
    }

    strong {
        color: ${styles.colors.text.active};
    }
`;
