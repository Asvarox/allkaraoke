import { useEffect } from 'react';
import { backgroundMusic } from 'SoundManager';

export default function useBackgroundMusic(play: boolean) {
    useEffect(() => {
        if (play) {
            if (!backgroundMusic.playing()) {
                backgroundMusic.play();
            }
        } else {
            backgroundMusic.stop();
        }
    }, [play]);
}
