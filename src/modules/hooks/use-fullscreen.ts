import { useEffect } from 'react';

import useAutoFullscreenDisabled from '~/modules/hooks/use-auto-fullscreen-disabled';
import isE2E from '~/modules/utils/is-e2-e';
import { AutoEnableFullscreenSetting, useSettingValue } from '~/routes/settings/settings-state';

export default function useFullscreen() {
  const [autoEnableFullscreen] = useSettingValue(AutoEnableFullscreenSetting);
  const autoFullscreenDisabled = useAutoFullscreenDisabled();

  useEffect(() => {
    try {
      if (autoEnableFullscreen && !autoFullscreenDisabled && !isE2E()) {
        document.body.requestFullscreen().catch(console.info);
      }
    } catch (_e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-enable is intentionally a mount-only action
  }, []);
}
