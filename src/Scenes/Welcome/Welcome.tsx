import { Link } from 'wouter';
import { MenuButton, MenuContainer } from '../../Elements/Menu';
import useKeyboard from '../../Hooks/useKeyboard';

function Welcome() {
    const { register } = useKeyboard();
    return (
        <MenuContainer>
            <Link href="/game">
                <MenuButton data-test="sing-a-song" {...register('sing a song')}>
                    Sing a song
                </MenuButton>
            </Link>
            <Link href="/jukebox">
                <MenuButton {...register('jukebox')}>Jukebox</MenuButton>
            </Link>
            {false && (
                <Link href="/connect-phone">
                    <MenuButton {...register('connect phone')}>Connect Phone</MenuButton>
                </Link>
            )}
            <Link href="/edit">
                <MenuButton {...register('edit songs')}>Edit songs</MenuButton>
            </Link>
            <Link href="/convert">
                <MenuButton {...register('convert')}>Convert UltraStar .txt</MenuButton>
            </Link>
        </MenuContainer>
    );
}
export default Welcome;
