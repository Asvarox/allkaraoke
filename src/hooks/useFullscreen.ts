import { useEffect } from 'react';
import { AutoEnableFullscreenSetting, useSettingValue } from 'Scenes/Settings/SettingsState';

export default function useFullscreen() {
  const [autoEnableFullscreen] = useSettingValue(AutoEnableFullscreenSetting);

  useEffect(() => {
    try {
      if (autoEnableFullscreen) {
        document.body.requestFullscreen().catch(console.info);
      }
    } catch (e) {}
  }, []);
}
