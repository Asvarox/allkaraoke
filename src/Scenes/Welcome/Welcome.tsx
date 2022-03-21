import { Link } from 'wouter';
import { MenuButton, MenuContainer } from '../../Elements/Menu';
import { navigate } from '../../Hooks/useHashLocation';
import useKeyboard from '../../Hooks/useKeyboard';

function Welcome() {
    const { register } = useKeyboard();
    return (
        <MenuContainer>
            <Link href="/game">
                <MenuButton data-test="sing-a-song" {...register('sing a song', () => navigate('/game'))}>
                    Sing a song
                </MenuButton>
            </Link>
            <Link href="/jukebox">
                <MenuButton {...register('jukebox', () => navigate('/jukebox'))}>Jukebox</MenuButton>
            </Link>
            {false && (
                <Link href="/connect-phone">
                    <MenuButton {...register('connect phone')}>Connect Phone</MenuButton>
                </Link>
            )}
            <Link href="/edit">
                <MenuButton {...register('edit songs', () => navigate('/edit'))}>Edit songs</MenuButton>
            </Link>
            <Link href="/convert">
                <MenuButton {...register('convert', () => navigate('/convert'))}>Convert UltraStar .txt</MenuButton>
            </Link>
        </MenuContainer>
    );
}
export default Welcome;
