import MenuWithLogo from 'Elements/MenuWithLogo';
import SuggestMobileMode from 'Scenes/QuickSetup/SuggestMobileMode';
import SelectInputView from 'Scenes/SelectInput/SelectInputView';
import { MicSetupPreference, MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import { useMemo } from 'react';
import isDev from 'utils/isDev';

interface Props {
  // file?: string;
}

function QuickSetup(props: Props) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const isMobile = useMemo(
    () =>
      window.matchMedia(
        'only screen and (((max-width: 500px) and (max-aspect-ratio: 10/16)) or ((max-height: 500px) and (min-aspect-ratio: 16/10)))',
      ).matches,
    [],
  );

  const navigate = useSmoothNavigate();
  const onFinish = async (pref: (typeof MicSetupPreference)[number]) => {
    navigate('');
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
      {mobilePhoneMode === null && isMobile ? (
        <SuggestMobileMode />
      ) : (
        <MenuWithLogo>
          <SelectInputView onFinish={onFinish} closeButtonText="Sing a song" smooth={false} />
        </MenuWithLogo>
      )}
    </>
  );
}

export default QuickSetup;
