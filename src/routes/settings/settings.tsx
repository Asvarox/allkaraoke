import { ReactNode, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import CameraManager from '~/modules/camera/camera-manager';
import { Menu } from '~/modules/elements/akui/menu';
import Loader from '~/modules/elements/loader';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import { NavButton, NavSwitcher } from '~/modules/elements/nav-controls';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useKeyboardNav, { KeyboardNavContext } from '~/modules/hooks/use-keyboard-nav';
import useMobileModeDisabled from '~/modules/hooks/use-mobile-mode-disabled';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
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

  const { register } = useKeyboardNav({ onBackspace: goBack, title: 'Settings' });

  const [graphicLevel, setGraphicLevel] = useSettingValue(GraphicSetting);
  const [fpsCount, setFpsCount] = useSettingValue(FPSCountSetting);
  const [mobilePhoneMode, setMobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const mobileModeDisabled = useMobileModeDisabled();

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
    cameraValue = 'Loading';
    cameraDisplayValue = <Loader />;
  } else if (camera === null) {
    cameraValue = 'Click to enable';
    cameraDisplayValue = 'Click to enable';
  } else if (camera) {
    cameraValue = 'Enabled';
    cameraDisplayValue = 'Enabled';
  }

  return (
    <MenuWithLogo>
      <Helmet>
        <title>Settings | AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <Menu.Header>Settings</Menu.Header>
      <KeyboardNavContext value={register}>
        <NavSwitcher
          name="graphics-level"
          label="Graphics"
          value={graphicLevel.toUpperCase()}
          onClick={() => setGraphicLevel(nextValue(GraphicsLevel, graphicLevel))}
        />
        <NavSwitcher
          name="fps-count-level"
          label="FPS Count"
          value={fpsCount}
          onClick={() => setFpsCount(nextValue(FpsCount, fpsCount))}
        />
        <NavButton
          name="calibration-settings"
          size="small"
          info="If the sound is not synchronised with the lyrics, use this to compensate it."
          onClick={() => navigate('settings/calibration/')}>
          Calibrate input lag
        </NavButton>
        <hr />
        <NavSwitcher
          name="camera-access"
          label="Enable camera mode"
          remoteLabel="Camera mode"
          value={cameraValue}
          displayValue={cameraDisplayValue}
          info="Record a timelapse video from singing. The recording is not sent nor stored anywhere."
          onClick={() => (camera ? CameraManager.disable() : enableCamera())}
        />
        {!mobileModeDisabled && (
          <>
            <hr />
            <NavSwitcher
              name="mobile-phone-mode"
              label="Mobile Phone Mode"
              value={mobilePhoneMode ? 'Yes' : 'No'}
              info="Adjust the game to a smaller screen. Disables option to sing in duets."
              onClick={() => setMobilePhoneMode(!mobilePhoneMode)}
            />
          </>
        )}
        <hr />
        <NavButton
          name="remote-mics-settings"
          size="small"
          remoteLabel="Remote mics settings"
          onClick={() => navigate('settings/remote-mics/')}>
          Remote Microphones Settings
        </NavButton>
        <NavButton name="setup-mics-button" size="small" onClick={() => navigate('select-input/')}>
          Setup Microphones
        </NavButton>
        <NavButton name="manage-songs-button" size="small" onClick={() => navigate('manage-songs/')}>
          Manage Songs
        </NavButton>
        <NavButton name="back-button" variant="back" onClick={goBack}>
          Return To Main Menu
        </NavButton>
      </KeyboardNavContext>
    </MenuWithLogo>
  );
}

export default Settings;
