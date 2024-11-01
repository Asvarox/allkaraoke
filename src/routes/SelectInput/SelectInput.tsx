import MenuWithLogo from 'modules/Elements/MenuWithLogo';
import useSmoothNavigate from 'modules/hooks/useSmoothNavigate';
import { Helmet } from 'react-helmet';
import SelectInputView from 'routes/SelectInput/SelectInputView';

function SelectInput() {
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
