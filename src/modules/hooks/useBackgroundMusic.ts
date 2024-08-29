import { backgroundMusic, christmasBackgroundMusic } from 'modules/SoundManager';
import { useEffect } from 'react';
import { BackgroundThemeSetting, useSettingValue } from 'routes/Settings/SettingsState';

export default function useBackgroundMusic(play: boolean) {
  const [christmasMode] = useSettingValue(BackgroundThemeSetting);

  const music = christmasMode === 'christmas' ? christmasBackgroundMusic : backgroundMusic;

  useEffect(() => {
    if (play) {
      if (!music.playing()) {
        music.play(false);
      }
    } else {
      music.stop();
    }
  }, [play]);
}
