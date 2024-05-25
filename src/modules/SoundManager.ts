import christmasBackgroundMusicSound from 'assets/2020-12-16_-_Christmas_Rock_-_www.FesliyanStudios.com_Steve_Oxen.ogg';
import waitFinishedSound from 'assets/376817__original_sound__impact-cinematic.ogg';
import classicBackgroundMusicSound from 'assets/421888__b-sean__retro.ogg';
import waitForReadinessSound from 'assets/459342__papaninkasettratat__cinematic-music-short.ogg';
import wooshSound from 'assets/60013__qubodup__whoosh.mp3';
import backgroundMusicSound from 'assets/Funk Cool Groove (No Copyright Music) By Anwar Amr.ogg';
import menuBackSound from 'assets/menu_back.mp3';
import menuEnterSound from 'assets/menu_enter.mp3';
import menuNavigateSound from 'assets/menu_navigate.mp3';

class Sound {
  private sound: HTMLAudioElement | null = null;
  constructor(
    private options: {
      src: string;
      volume?: number;
      loop?: boolean;
      preload?: boolean;
    },
  ) {
    if (global.Audio) {
      this.sound = new Audio(options.src);
      this.sound.preload = options.preload ? 'auto' : 'none';
      this.sound.volume = options.volume ?? 1;
      this.sound.loop = options.loop ?? false;
    }
  }

  public play = async (parallel = true) => {
    try {
      if (parallel && this.playing()) {
        const clonedNode = this.sound?.cloneNode(true) as HTMLAudioElement;
        await clonedNode.play();
        clonedNode.remove();
      } else {
        await this.sound?.play();
      }
    } catch (data) {
      return console.warn(data);
    }
  };

  public pause = () => {
    this.sound?.pause();
  };

  public stop = () => {
    if (this.sound) {
      this.sound.pause();
      this.sound.currentTime = 0;
    }
  };

  public playing = () => {
    return !this.sound?.paused;
  };
}

export const menuNavigate = new Sound({
  src: menuNavigateSound,
});

export const menuEnter = new Sound({
  src: menuEnterSound,
});

export const menuBack = new Sound({
  src: menuBackSound,
});

export const waitFinished = new Sound({
  src: waitFinishedSound,
  preload: true,
});

export const woosh = new Sound({
  src: wooshSound,
  preload: true,
  volume: 0.5,
});

export const backgroundMusic = new Sound({
  src: backgroundMusicSound,
  volume: 0.3,
  loop: true,
});
export const classicBackgroundMusic = new Sound({
  src: classicBackgroundMusicSound,
  volume: 0.4,
  loop: true,
});
export const christmasBackgroundMusic = new Sound({
  src: christmasBackgroundMusicSound,
  volume: 0.25,
  loop: true,
});

export const waitForReadinessMusic = new Sound({ src: waitForReadinessSound, volume: 0.8 });
