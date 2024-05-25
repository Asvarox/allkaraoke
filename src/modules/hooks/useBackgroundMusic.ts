import { backgroundMusic, christmasBackgroundMusic, classicBackgroundMusic } from 'modules/SoundManager';
import { useEffect } from 'react';
import { BackgroundMusicSetting, BackgroundThemeSetting, useSettingValue } from 'routes/Settings/SettingsState';

export default function useBackgroundMusic(play: boolean) {
  const [christmasMode] = useSettingValue(BackgroundThemeSetting);
  const [backgroundMusicSelection] = useSettingValue(BackgroundMusicSetting);

  const music =
    christmasMode === 'christmas'
      ? christmasBackgroundMusic
      : backgroundMusicSelection === 'Classic'
        ? classicBackgroundMusic
        : backgroundMusic;

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
