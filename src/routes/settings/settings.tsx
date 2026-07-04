import { useFeatureFlagVariantKey } from 'posthog-js/react';
import { ReactNode, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import CameraManager from '~/modules/camera/camera-manager';
import { Menu } from '~/modules/elements/akui/menu';
import Loader from '~/modules/elements/loader';
import { MenuButton } from '~/modules/elements/menu';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import { Switcher } from '~/modules/elements/switcher';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import { FeatureFlags } from '~/modules/utils/feature-flags';
import { nextValue } from '~/modules/utils/indexes';
import {
  FpsCount,
  FPSCountSetting,
  GraphicSetting,
  GraphicsLevel,
  MobilePhoneModeSetting,
  useSettingValue,
} from '~/routes/settings/settings-state';

function Settings() {
  useBackgroundMusic(false);
  const navigate = useSmoothNavigate();
  const goBack = () => navigate('menu/');

  const { register } = useKeyboardNav({ onBackspace: goBack });

  const [graphicLevel, setGraphicLevel] = useSettingValue(GraphicSetting);
  const [fpsCount, setFpsCount] = useSettingValue(FPSCountSetting);
  const [mobilePhoneMode, setMobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  // Not using the shared useFeatureFlag helper: it force-enables flags in dev/e2e, which would
  // hide this setting instead of showing it as expected there.
  // This is an experiment (control/test variants), so control is the safe default if evaluation fails.
  const mobileModeDisabled = useFeatureFlagVariantKey(FeatureFlags.DisableMobileMode) === 'test';

  const [camera, setCamera] = useState<null | boolean>(CameraManager.getPermissionStatus());
  useEffect(() => {
    return CameraManager.addListener((status) => {
      setCamera(status);
    });
  }, []);

  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const enableCamera = () => {
    setIsRequestInProgress(true);
    CameraManager.requestPermissions().then(() => setIsRequestInProgress(false));
  };

  let cameraValue = 'disabled';
  let cameraDisplayValue: ReactNode = 'Disabled';
  if (isRequestInProgress) {
    cameraValue = 'loading';
    cameraDisplayValue = <Loader />;
  } else if (camera === null) {
    cameraValue = 'click-to-enable';
    cameraDisplayValue = 'Click to enable';
  } else if (camera) {
    cameraValue = 'enabled';
    cameraDisplayValue = 'Enabled';
  }

  return (
    <MenuWithLogo>
      <Helmet>
        <title>Settings | AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <Menu.Header>Settings</Menu.Header>
      <Switcher
        {...register('graphics-level', () => setGraphicLevel(nextValue(GraphicsLevel, graphicLevel)))}
        label="Graphics"
        value={graphicLevel.toUpperCase()}
      />
      <Switcher
        {...register('fps-count-level', () => setFpsCount(nextValue(FpsCount, fpsCount)))}
        label="FPS Count"
        value={fpsCount}
      />
      <Menu.Button
        {...register('calibration-settings', () => navigate('settings/calibration/'))}
        size="small"
        info="If the sound is not synchronised with the lyrics, use this to compensate it.">
        Calibrate input lag
      </Menu.Button>
      <hr />
      <Switcher
        {...register('camera-access', () => (camera ? CameraManager.disable() : enableCamera()))}
        label="Enable camera mode"
        value={cameraValue}
        displayValue={cameraDisplayValue}
        info="Record a timelapse video from singing. The recording is not sent nor stored anywhere."
      />
      {!mobileModeDisabled && (
        <>
          <hr />
          <Switcher
            {...register('mobile-phone-mode', () => setMobilePhoneMode(!mobilePhoneMode))}
            label="Mobile Phone Mode"
            value={mobilePhoneMode ? 'Yes' : 'No'}
            info="Adjust the game to a smaller screen. Disables option to sing in duets."
          />
        </>
      )}
      <hr />
      <MenuButton {...register('remote-mics-settings', () => navigate('settings/remote-mics/'))} size="small">
        Remote Microphones Settings
      </MenuButton>
      <MenuButton {...register('setup-mics-button', () => navigate('select-input/'))} size="small">
        Setup Microphones
      </MenuButton>
      <MenuButton {...register('manage-songs-button', () => navigate('manage-songs/'))} size="small">
        Manage Songs
      </MenuButton>
      <MenuButton {...register('back-button', goBack)}>Return To Main Menu</MenuButton>
    </MenuWithLogo>
  );
}

export default Settings;
