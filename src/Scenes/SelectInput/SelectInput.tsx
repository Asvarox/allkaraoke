import MenuWithLogo from 'Elements/MenuWithLogo';
import SelectInputView from 'Scenes/SelectInput/SelectInputView';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import { Helmet } from 'react-helmet';

interface Props {
  // file?: string;
}

function SelectInput(props: Props) {
  const navigate = useSmoothNavigate();

  return (
    <MenuWithLogo>
      <Helmet>
        <title>Select Input | AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <SelectInputView onFinish={() => navigate('menu/')} closeButtonText={'Go to main menu'} />
    </MenuWithLogo>
  );
}
export default SelectInput;
