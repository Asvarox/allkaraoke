import styled from 'styled-components';
import { Link } from 'wouter';
import { Button } from '../../Elements/Button';

function Welcome() {
    return (
        <MenuContainer>
            <Link href="/game">
                <MenuButton>
                    <h1>Sing a song</h1>
                </MenuButton>
            </Link>
            <Link href="/jukebox">
                <MenuButton>
                    <h1>Jukebox</h1>
                </MenuButton>
            </Link>
            <Link href="/edit">
                <MenuButton>
                    <h1>Edit songs</h1>
                </MenuButton>
            </Link>
            <Link href="/convert">
                <MenuButton>
                    <h1>Convert UltraStar .txt</h1>
                </MenuButton>
            </Link>
        </MenuContainer>
    );
}

const MenuButton = styled(Button)`
    width: 650px;
    margin: 30px 0;
    height: 100px;
    font-size: 20px;
`;

const MenuContainer = styled.div`
    background: rgba(0, 0, 0, .5);
    backdrop-filter: blur(20px);
    padding: 20px;
    width: 650px;
    margin: 50px auto;
`;

export default Welcome;
