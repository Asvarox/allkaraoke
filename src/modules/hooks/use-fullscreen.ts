import { useEffect } from 'react';

import { AutoEnableFullscreenSetting, useSettingValue } from '~/routes/settings/settings-state';

export default function useFullscreen() {
  const [autoEnableFullscreen] = useSettingValue(AutoEnableFullscreenSetting);

  useEffect(() => {
    try {
      if (autoEnableFullscreen) {
        document.body.requestFullscreen().catch(console.info);
      }
    } catch (_e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-enable is intentionally a mount-only action
  }, []);
}
