import { MenuButton } from 'Elements/Menu';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { Link } from 'wouter';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import MenuWithLogo from 'Elements/MenuWithLogo';
import { MouseEventHandler } from 'react';

interface Props {}

function ManageSongs(props: Props) {
    const navigate = useSmoothNavigate();
    const goBack = () => navigate('/');

    const { register } = useKeyboardNav({ onBackspace: goBack });

    const handleClick: (url: string) => MouseEventHandler<HTMLAnchorElement> = (url) => (e) => {
        e.preventDefault();
        navigate(url);
    };

    return (
        <MenuWithLogo>
            <h1>Manage Songs</h1>
            <Link href="/exclude-languages" onClick={handleClick('/exclude-languages')}>
                <MenuButton
                    data-test="exclude-languages"
                    {...register('exclude-languages', () => navigate('/exclude-languages'))}>
                    Select Song Languages
                </MenuButton>
            </Link>
            <Link href="/edit" onClick={handleClick('/edit')}>
                <MenuButton data-test="edit-songs" {...register('edit songs', () => navigate('/edit'))}>
                    Edit songs
                </MenuButton>
            </Link>
            <Link href="/convert" onClick={handleClick('/convert')}>
                <MenuButton data-test="convert-song" {...register('convert', () => navigate('/convert'))}>
                    Convert UltraStar .txt
                </MenuButton>
            </Link>
            <hr />
            <MenuButton {...register('go back', goBack)} data-test="back-button">
                Return To Main Menu
            </MenuButton>
        </MenuWithLogo>
    );
}

export default ManageSongs;
