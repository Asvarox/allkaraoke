import { useEffect } from 'react';
import { backgroundMusic, classicBackgroundMusic } from 'SoundManager';
import { BackgroundMusicSetting, useSettingValue } from 'Scenes/Settings/SettingsState';

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
