import { ComponentProps, useEffect, useState } from 'react';

import { Button } from '~/modules/elements/akui/button';
import { Icon } from '~/modules/elements/akui/icon';
import { Tooltip } from '~/modules/elements/tooltip';
import '~/modules/remote-mic/event-listeners';
import '~/modules/stats/index';
import { AutoEnableFullscreenSetting, MobilePhoneModeSetting, useSettingValue } from '~/routes/settings/settings-state';

interface Props {
  /** Callers set this to match whatever icon size their surrounding toolbar uses. */
  size?: ComponentProps<typeof Button>['size'];
}

function FullscreenButton({ size = 'large' }: Props) {
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
      <Button
        size={size}
        type="button"
        data-test="toggle-fullscreen"
        aria-label="Toggle fullscreen"
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
        }}
        leftIcon={<Icon icon={isFullScreen ? 'ic:baseline-fullscreen-exit' : 'ic:baseline-fullscreen'} />}
      />
    </Tooltip>
  );
}
export default FullscreenButton;
