import { Helmet } from 'react-helmet';

import { Menu } from '~/modules/elements/akui/menu';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import { NavButton } from '~/modules/elements/nav-controls';
import useKeyboardNav, { KeyboardNavContext } from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import { useSetlist } from '~/modules/songs/hooks/use-setlist';

function ManageSongs() {
  const navigate = useSmoothNavigate();
  const goBack = () => navigate('menu/');
  const setlist = useSetlist();

  const { register } = useKeyboardNav({ onBackspace: goBack, title: 'Manage Songs' });

  return (
    <MenuWithLogo>
      <Helmet>
        <title>Manage Songs | AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <Menu.Header>Manage Songs</Menu.Header>
      <KeyboardNavContext value={register}>
        <NavButton name="exclude-languages" onClick={() => navigate('exclude-languages/')}>
          Select Song Languages
        </NavButton>
        {setlist.isEditable && (
          <>
            <NavButton name="edit-songs" onClick={() => navigate('edit/list/')}>
              Edit songs
            </NavButton>
            <NavButton name="edit-setlists" onClick={() => navigate('edit/setlists')}>
              Manage setlists
            </NavButton>
            <NavButton name="convert-song" onClick={() => navigate('convert/')}>
              Convert UltraStar .txt
            </NavButton>
          </>
        )}
        <hr />
        <NavButton name="back-button" variant="back" onClick={goBack}>
          Return To Main Menu
        </NavButton>
      </KeyboardNavContext>
    </MenuWithLogo>
  );
}

export default ManageSongs;
