import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { Link, useLocation } from 'wouter';

interface Props {}

function ManageSongs(props: Props) {
    const [, navigate] = useLocation();
    const goBack = () => navigate('/');

    const { register } = useKeyboardNav({ onBackspace: goBack });

    return (
        <LayoutWithBackground>
            <MenuContainer>
                <h1>Manage Songs</h1>
                <Link href="/exclude-languages">
                    <MenuButton
                        data-test="exclude-languages"
                        {...register('exclude-languages', () => navigate('/exclude-languages'))}>
                        Select Song Languages
                    </MenuButton>
                </Link>
                <Link href="/edit">
                    <MenuButton data-test="edit-songs" {...register('edit songs', () => navigate('/edit'))}>
                        Edit songs
                    </MenuButton>
                </Link>
                <Link href="/convert">
                    <MenuButton data-test="convert-song" {...register('convert', () => navigate('/convert'))}>
                        Convert UltraStar .txt
                    </MenuButton>
                </Link>
                <hr />
                <MenuButton {...register('go back', goBack)} data-test="back-button">
                    Return To Main Menu
                </MenuButton>
            </MenuContainer>
        </LayoutWithBackground>
    );
}

export default ManageSongs;
