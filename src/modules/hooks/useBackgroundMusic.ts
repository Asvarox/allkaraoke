import { useEffect } from 'react';
import { backgroundMusic } from '~/modules/SoundManager';

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
