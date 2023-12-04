import christmasBackgroundMusicSound from 'assets/2020-12-16_-_Christmas_Rock_-_www.FesliyanStudios.com_Steve_Oxen.mp3';
import waitFinishedSound from 'assets/376817__original_sound__impact-cinematic.wav';
import classicBackgroundMusicSound from 'assets/421888__b-sean__retro.mp3';
import wooshSound from 'assets/60013__qubodup__whoosh.mp3';
import backgroundMusicSound from 'assets/Funk Cool Groove (No Copyright Music) By Anwar Amr.mp3';
import menuBackSound from 'assets/menu_back.wav';
import menuEnterSound from 'assets/menu_enter.wav';
import menuNavigateSound from 'assets/menu_navigate.wav';

class Sound {
  private sound: HTMLAudioElement;
  constructor(
    private options: {
      src: string;
      volume?: number;
      loop?: boolean;
      preload?: boolean;
    },
  ) {
    this.sound = new Audio(options.src);
    this.sound.preload = options.preload ? 'auto' : 'none';
    this.sound.volume = options.volume ?? 1;
    this.sound.loop = options.loop ?? false;
  }

  public play = async (parallel = true) => {
    try {
      if (parallel && this.playing()) {
        const clonedNode = this.sound.cloneNode(true) as HTMLAudioElement;
        await clonedNode.play();
        clonedNode.remove();
      } else {
        await this.sound.play();
      }
    } catch (data) {
      return console.warn(data);
    }
  };

  public pause = () => {
    this.sound.pause();
  };

  public stop = () => {
    this.sound.pause();
    this.sound.currentTime = 0;
  };

  public playing = () => {
    return !this.sound.paused;
  };
}

const menuNavigate = new Sound({
  src: menuNavigateSound,
});

const menuEnter = new Sound({
  src: menuEnterSound,
});

const menuBack = new Sound({
  src: menuBackSound,
});

const waitFinished = new Sound({
  src: waitFinishedSound,
  preload: true,
});

const woosh = new Sound({
  src: wooshSound,
  preload: true,
  volume: 0.5,
});

const backgroundMusic = new Sound({
  src: backgroundMusicSound,
  volume: 0.3,
  loop: true,
});
const classicBackgroundMusic = new Sound({
  src: classicBackgroundMusicSound,
  volume: 0.4,
  loop: true,
});
const christmasBackgroundMusic = new Sound({
  src: christmasBackgroundMusicSound,
  volume: 0.25,
  loop: true,
});

export {
  backgroundMusic,
  christmasBackgroundMusic,
  classicBackgroundMusic,
  menuBack,
  menuEnter,
  menuNavigate,
  waitFinished,
  woosh,
};
