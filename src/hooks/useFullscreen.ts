import { useEffect } from 'react';
import { AutoEnableFullscreenSetting, useSettingValue } from 'Scenes/Settings/SettingsState';

export default function useFullscreen() {
  const [autoEnableFullscreen] = useSettingValue(AutoEnableFullscreenSetting);

  useEffect(() => {
    try {
      if (autoEnableFullscreen && process.env.NODE_ENV !== 'development') {
        document.body.requestFullscreen().catch(console.info);
      }
    } catch (e) {}
  }, []);
}
