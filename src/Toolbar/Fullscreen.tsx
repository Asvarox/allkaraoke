import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import 'RemoteMic/eventListeners';
import { MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import 'Stats';
import { useEffect, useState } from 'react';

function FullscreenButton() {
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
              await document.body.requestFullscreen();
              if (mobilePhoneMode) {
                window.screen.orientation.unlock();
                await window.screen.orientation.lock('landscape');
              }
            } else {
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
