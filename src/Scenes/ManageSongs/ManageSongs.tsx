import { LinkButton } from 'Elements/Button';
import { MenuButton } from 'Elements/Menu';
import MenuWithLogo from 'Elements/MenuWithLogo';
import SmoothLink from 'Elements/SmoothLink';
import useKeyboardNav from 'hooks/useKeyboardNav';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import { Helmet } from 'react-helmet';

interface Props {}

function ManageSongs(props: Props) {
  const navigate = useSmoothNavigate();
  const goBack = () => navigate('menu/');

  const { register } = useKeyboardNav({ onBackspace: goBack });

  return (
    <MenuWithLogo>
      <Helmet>
        <title>Manage Songs | AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <h1>Manage Songs</h1>
      <SmoothLink to="exclude-languages/">
        <MenuButton as={LinkButton} {...register('exclude-languages', () => navigate('exclude-languages/'))}>
          Select Song Languages
        </MenuButton>
      </SmoothLink>
      <SmoothLink to="edit/list/">
        <MenuButton as={LinkButton} {...register('edit-songs', () => navigate('edit/list/'))}>
          Edit songs
        </MenuButton>
      </SmoothLink>
      <SmoothLink to="convert/">
        <MenuButton as={LinkButton} {...register('convert-song', () => navigate('convert/'))}>
          Convert UltraStar .txt
        </MenuButton>
      </SmoothLink>
      <hr />
      <SmoothLink to="menu/">
        <MenuButton as={LinkButton} {...register('back-button', goBack)}>
          Return To Main Menu
        </MenuButton>
      </SmoothLink>
    </MenuWithLogo>
  );
}

export default ManageSongs;
