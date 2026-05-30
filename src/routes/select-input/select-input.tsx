import { Helmet } from 'react-helmet';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import SelectInputView from '~/routes/select-input/select-input-view';

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
