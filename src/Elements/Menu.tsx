import styled from '@emotion/styled';
import { Button } from './Button';

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
    width: 100%;
    box-sizing: border-box;
    max-width: 75rem;
    margin: 2rem auto 0 auto;
    font-size: 2.6rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
`;
