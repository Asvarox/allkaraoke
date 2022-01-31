import { Link } from 'wouter';
import { MenuButton, MenuContainer } from '../../Elements/Menu';

function Welcome() {
    return (
        <MenuContainer>
            <Link href="/game">
                <MenuButton data-test="sing-a-song">Sing a song</MenuButton>
            </Link>
            <Link href="/jukebox">
                <MenuButton>Jukebox</MenuButton>
            </Link>
            <Link href="/edit">
                <MenuButton>Edit songs</MenuButton>
            </Link>
            <Link href="/convert">
                <MenuButton>Convert UltraStar .txt</MenuButton>
            </Link>
        </MenuContainer>
    );
}
export default Welcome;
