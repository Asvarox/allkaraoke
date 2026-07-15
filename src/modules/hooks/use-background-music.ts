import { useEffect } from 'react';

import { backgroundMusic } from '~/modules/sound-manager';

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
