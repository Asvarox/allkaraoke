import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { Tooltip } from 'Elements/Tooltip';
import 'RemoteMic/eventListeners';
import { AutoEnableFullscreenSetting, MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import 'Stats';
import { useEffect, useState } from 'react';

function FullscreenButton() {
  const [, setAutoEnableFullscreen] = useSettingValue(AutoEnableFullscreenSetting);
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const [isFullScreen, setIsFullScreen] = useState(document.fullscreenElement !== null);

  useEffect(() => {
    const onChange = () => {
      setIsFullScreen(document.fullscreenElement !== null);
    };
    document.addEventListener('fullscreenchange', onChange);

    return () => {
      document.removeEventListener('fullscreenchange', onChange);
    };
  }, []);

  return (
    <Tooltip title="Toggle fullscreen">
      <IconButton
        size="small"
        onClick={async () => {
          try {
            if (document.fullscreenElement === null) {
              setAutoEnableFullscreen(true);
              await document.body.requestFullscreen();
              if (mobilePhoneMode) {
                window.screen.orientation.unlock();
                await window.screen.orientation.lock?.('landscape');
              }
            } else {
              setAutoEnableFullscreen(false);
              await document.exitFullscreen();
              if (mobilePhoneMode) {
                window.screen.orientation.unlock();
              }
            }
          } catch (e) {
            console.info(e);
          }
        }}>
        {isFullScreen ? <FullscreenExit /> : <Fullscreen />}
      </IconButton>
    </Tooltip>
  );
}
export default FullscreenButton;
