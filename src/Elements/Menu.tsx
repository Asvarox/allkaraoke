import styled from 'styled-components';
import styles from '../Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { Button } from './Button';
import { typography } from './cssMixins';

export const MenuButton = styled(Button)<{ focused?: boolean }>`
    margin: 5px 0;
    height: 100px;
`;

export const MenuContainer = styled.div`
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(20px);
    padding: 20px;
    width: 750px;
    margin: 50px auto;
    font-size: 26px;
    display: flex;
    flex-direction: column;
    gap: 25px;

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
        margin: 10px;
        opacity: 0.25;
    }
`;
