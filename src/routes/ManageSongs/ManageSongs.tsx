import { MenuButton } from 'modules/Elements/Menu';
import MenuWithLogo from 'modules/Elements/MenuWithLogo';
import SmoothLink from 'modules/Elements/SmoothLink';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';
import useSmoothNavigate from 'modules/hooks/useSmoothNavigate';
import { useSetlist } from 'modules/Songs/hooks/useSetlist';
import { Helmet } from 'react-helmet';

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
      <h1>Manage Songs</h1>
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
          <SmoothLink to="edit/setlists/">
            <MenuButton {...register('edit-setlists', () => navigate('edit/setlists/'))}>Manage setlists</MenuButton>
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
