import { Helmet } from 'react-helmet';

import { Menu } from '~/modules/elements/akui/menu';
import { MenuButton } from '~/modules/elements/menu';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import SmoothLink from '~/modules/elements/smooth-link';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import { useSetlist } from '~/modules/songs/hooks/use-setlist';

function ManageSongs() {
  const navigate = useSmoothNavigate();
  const goBack = () => navigate('menu/');
  const setlist = useSetlist();

  const { register } = useKeyboardNav({ onBackspace: goBack });

  return (
    <MenuWithLogo>
      <Helmet>
        <title>Manage Songs | AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <Menu.Header>Manage Songs</Menu.Header>
      <SmoothLink to="exclude-languages/">
        <MenuButton {...register('exclude-languages', () => navigate('exclude-languages/'))}>
          Select Song Languages
        </MenuButton>
      </SmoothLink>
      {setlist.isEditable && (
        <>
          <SmoothLink to="edit/list/">
            <MenuButton {...register('edit-songs', () => navigate('edit/list/'))}>Edit songs</MenuButton>
          </SmoothLink>
          <SmoothLink to="edit/setlists">
            <MenuButton {...register('edit-setlists', () => navigate('edit/setlists'))}>Manage setlists</MenuButton>
          </SmoothLink>
          <SmoothLink to="convert/">
            <MenuButton {...register('convert-song', () => navigate('convert/'))}>Convert UltraStar .txt</MenuButton>
          </SmoothLink>
        </>
      )}
      <hr />
      <SmoothLink to="menu/">
        <MenuButton {...register('back-button', goBack)}>Return To Main Menu</MenuButton>
      </SmoothLink>
    </MenuWithLogo>
  );
}

export default ManageSongs;
