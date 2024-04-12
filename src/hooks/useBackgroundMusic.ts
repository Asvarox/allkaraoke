import { BackgroundMusicSetting, BackgroundThemeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import { backgroundMusic, christmasBackgroundMusic, classicBackgroundMusic } from 'SoundManager';
import { useEffect } from 'react';

export default function useBackgroundMusic(play: boolean) {
  const [christmasMode] = useSettingValue(BackgroundThemeSetting);
  const [backgroundMusicSelection] = useSettingValue(BackgroundMusicSetting);

  const music = christmasMode
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
