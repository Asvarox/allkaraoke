import styled from 'styled-components';
import { Button } from './Button';
import { focusable } from './cssMixins';

export const MenuButton = styled(Button)<{ focused?: boolean }>`
    width: 650px;
    margin: 30px 0;
    height: 100px;
    font-size: 40px;

    ${focusable}
`;

export const MenuContainer = styled.div`
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(20px);
    padding: 20px;
    width: 650px;
    margin: 50px auto;
`;
