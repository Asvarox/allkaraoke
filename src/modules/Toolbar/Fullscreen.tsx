import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import 'modules/RemoteMic/eventListeners';
import 'modules/Stats';
import { useEffect, useState } from 'react';
import { Tooltip } from '~/modules/Elements/Tooltip';
import { AutoEnableFullscreenSetting, MobilePhoneModeSetting, useSettingValue } from '~/routes/Settings/SettingsState';

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
    <Tooltip title="Toggle fullscreen" place="bottom-end">
      <IconButton
        data-test="toggle-fullscreen"
        size="small"
        onClick={async () => {
          try {
            if (document.fullscreenElement === null) {
              setAutoEnableFullscreen(true);
              await document.body.requestFullscreen();
              if (mobilePhoneMode) {
                global.screen.orientation.unlock();
                await global.screen.orientation.lock?.('landscape');
              }
            } else {
              setAutoEnableFullscreen(false);
              await document.exitFullscreen();
              if (mobilePhoneMode) {
                global.screen.orientation.unlock();
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
