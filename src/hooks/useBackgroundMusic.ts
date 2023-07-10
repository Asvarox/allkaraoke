import { BackgroundMusicSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import { backgroundMusic, classicBackgroundMusic } from 'SoundManager';
import { useEffect } from 'react';

export default function useBackgroundMusic(play: boolean) {
    const [backgroundMusicSelection] = useSettingValue(BackgroundMusicSetting);

    const music = backgroundMusicSelection === 'Classic' ? classicBackgroundMusic : backgroundMusic;

    useEffect(() => {
        if (play) {
            if (!music.playing()) {
                music.play();
            }
        } else {
            music.stop();
        }
    }, [play]);
}
