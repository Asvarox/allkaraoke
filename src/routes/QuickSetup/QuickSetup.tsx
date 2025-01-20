import isMobile from 'is-mobile';
import MenuWithLogo from 'modules/Elements/MenuWithLogo';
import useSmoothNavigate from 'modules/hooks/useSmoothNavigate';
import isDev from 'modules/utils/isDev';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import SuggestMobileMode from 'routes/QuickSetup/SuggestMobileMode';
import SelectInputView from 'routes/SelectInput/SelectInputView';
import { MobilePhoneModeSetting, useSettingValue } from 'routes/Settings/SettingsState';

function QuickSetup() {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const isMobileDevice = useMemo(() => isMobile(), []);

  const navigate = useSmoothNavigate();
  const onFinish = async () => {
    navigate('menu/');
    if (!isDev() && mobilePhoneMode && document.fullscreenElement === null) {
      try {
        await document.body.requestFullscreen();
        global.screen.orientation.unlock();
        await global.screen.orientation.lock?.('landscape');
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
