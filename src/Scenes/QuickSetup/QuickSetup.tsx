import MenuWithLogo from 'Elements/MenuWithLogo';
import SuggestMobileMode from 'Scenes/QuickSetup/SuggestMobileMode';
import SelectInputView from 'Scenes/SelectInput/SelectInputView';
import { MicSetupPreference, MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import isMobile from 'is-mobile';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import isDev from 'utils/isDev';

interface Props {
  // file?: string;
}

function QuickSetup(props: Props) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const isMobileDevice = useMemo(() => isMobile(), []);

  const navigate = useSmoothNavigate();
  const onFinish = async (pref: (typeof MicSetupPreference)[number]) => {
    navigate('menu/');
    if (!isDev() && mobilePhoneMode && document.fullscreenElement === null) {
      try {
        await document.body.requestFullscreen();
        window.screen.orientation.unlock();
        await window.screen.orientation.lock?.('landscape');
      } catch (e) {
        console.info(e);
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Select Input | AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      {mobilePhoneMode === null && isMobileDevice ? (
        <SuggestMobileMode />
      ) : (
        <MenuWithLogo>
          <SelectInputView onFinish={onFinish} closeButtonText="Sing a song" smooth />
        </MenuWithLogo>
      )}
    </>
  );
}

export default QuickSetup;
