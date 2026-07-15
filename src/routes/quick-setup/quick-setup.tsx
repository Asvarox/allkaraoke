import isMobile from 'is-mobile';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet';

import MenuWithLogo from '~/modules/elements/menu-with-logo';
import useMobileModeDisabled from '~/modules/hooks/use-mobile-mode-disabled';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import isDev from '~/modules/utils/is-dev';
import SuggestMobileMode from '~/routes/quick-setup/suggest-mobile-mode';
import SelectInputView from '~/routes/select-input/select-input-view';
import { MobilePhoneModeSetting, useSettingValue } from '~/routes/settings/settings-state';

function QuickSetup() {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const isMobileDevice = useMemo(() => isMobile(), []);
  const mobileModeDisabled = useMobileModeDisabled();

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
      {mobilePhoneMode === null && isMobileDevice && !mobileModeDisabled ? (
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
