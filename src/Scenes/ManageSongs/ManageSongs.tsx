import { MenuButton } from 'Elements/Menu';
import MenuWithLogo from 'Elements/MenuWithLogo';
import SmoothLink from 'Elements/SmoothLink';
import useKeyboardNav from 'hooks/useKeyboardNav';
import useSmoothNavigate from 'hooks/useSmoothNavigate';

interface Props {}

function ManageSongs(props: Props) {
  const navigate = useSmoothNavigate();
  const goBack = () => navigate('menu/');

  const { register } = useKeyboardNav({ onBackspace: goBack });

  return (
    <MenuWithLogo>
      <h1>Manage Songs</h1>
      <SmoothLink to="exclude-languages/">
        <MenuButton {...register('exclude-languages', () => navigate('exclude-languages/'))}>
          Select Song Languages
        </MenuButton>
      </SmoothLink>
      <SmoothLink to="edit/list/">
        <MenuButton {...register('edit-songs', () => navigate('edit/list/'))}>Edit songs</MenuButton>
      </SmoothLink>
      <SmoothLink to="convert/">
        <MenuButton {...register('convert-song', () => navigate('convert/'))}>Convert UltraStar .txt</MenuButton>
      </SmoothLink>
      <hr />
      <MenuButton {...register('back-button', goBack)}>Return To Main Menu</MenuButton>
    </MenuWithLogo>
  );
}

export default ManageSongs;
