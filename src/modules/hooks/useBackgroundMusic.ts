import { backgroundMusic } from 'modules/SoundManager';
import { useEffect } from 'react';

export default function useBackgroundMusic(play: boolean) {
  useEffect(() => {
    if (play) {
      if (!backgroundMusic.playing()) {
        backgroundMusic.play(false);
      }
    } else {
      backgroundMusic.stop();
    }
  }, [play]);
}
