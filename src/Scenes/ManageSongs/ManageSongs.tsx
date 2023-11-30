import { MenuButton } from 'Elements/Menu';
import MenuWithLogo from 'Elements/MenuWithLogo';
import useKeyboardNav from 'hooks/useKeyboardNav';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import { MouseEventHandler } from 'react';
import { Link } from 'wouter';

interface Props {}

function ManageSongs(props: Props) {
  const navigate = useSmoothNavigate();
  const goBack = () => navigate('');

  const { register } = useKeyboardNav({ onBackspace: goBack });

  const handleClick: (url: string) => MouseEventHandler<HTMLAnchorElement> = (url) => (e) => {
    e.preventDefault();
    navigate(url);
  };

  return (
    <MenuWithLogo>
      <h1>Manage Songs</h1>
      <Link href="exclude-languages" onClick={handleClick('exclude-languages')}>
        <MenuButton {...register('exclude-languages', () => navigate('exclude-languages'))}>
          Select Song Languages
        </MenuButton>
      </Link>
      <Link href="edit" onClick={handleClick('edit')}>
        <MenuButton {...register('edit-songs', () => navigate('edit'))}>Edit songs</MenuButton>
      </Link>
      <Link href="convert" onClick={handleClick('convert')}>
        <MenuButton {...register('convert-song', () => navigate('convert'))}>Convert UltraStar .txt</MenuButton>
      </Link>
      <hr />
      <MenuButton {...register('back-button', goBack)}>Return To Main Menu</MenuButton>
    </MenuWithLogo>
  );
}

export default ManageSongs;
