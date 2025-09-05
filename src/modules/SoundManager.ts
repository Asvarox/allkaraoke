import christmasBackgroundMusicSound from 'assets/2020-12-16_-_Christmas_Rock_-_www.FesliyanStudios.com_Steve_Oxen.ogg';
import waitFinishedSound from 'assets/376817__original_sound__impact-cinematic.ogg';
import waitForReadinessSound from 'assets/459342__papaninkasettratat__cinematic-music-short.ogg';
import wooshSound from 'assets/60013__qubodup__whoosh.mp3';
import backgroundMusicSound from 'assets/Funk Cool Groove (No Copyright Music) By Anwar Amr.ogg';
import halloweenWaitFinishedSound from 'assets/halloween/boo-and-laugh-7060.mp3';
import halloweenWooshSound from 'assets/halloween/croworraven1-6749.mp3';
import halloweenBackgroundMusicSound from 'assets/halloween/Halloween Cinematic by Infraction [No Copyright Music]  Halloween 2024 [ ezmp3.cc ].mp3';
import halloweenSelectSongSound from 'assets/halloween/halloween-impact-05-93808.mp3';
import halloweenWaitForReadinessSound from 'assets/halloween/scary-music-box-for-spooky-scenes-165983.mp3';
import menuBackSound from 'assets/menu_back.mp3';
import menuEnterSound from 'assets/menu_enter.mp3';
import menuNavigateSound from 'assets/menu_navigate.mp3';
import { backgroundTheme } from 'modules/Elements/LayoutWithBackground';
import { BackgroundThemeSetting } from 'routes/Settings/SettingsState';

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
    if (globalThis.Audio) {
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
        if (this.sound) {
          this.sound.currentTime = 0;
          await this.sound?.play();
        }
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

class ThemedSound {
  constructor(
    private defaultSound: Sound,
    private themeOverrides?: Partial<Record<backgroundTheme, Sound>>,
  ) {}

  private getProperSound = () => {
    const theme = BackgroundThemeSetting.get();

    return this.themeOverrides?.[theme] ?? this.defaultSound;
  };

  public play = async (parallel = true) => this.getProperSound().play(parallel);
  public pause = () => this.getProperSound().pause();
  public stop = () => this.getProperSound().stop();
  public playing = () => this.getProperSound().playing();
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

export const woosh = new ThemedSound(
  new Sound({
    src: wooshSound,
    preload: true,
    volume: 0.5,
  }),
  {
    halloween: new Sound({
      src: halloweenWooshSound,
      preload: true,
      volume: 0.7,
    }),
  },
);

export const backgroundMusic = new ThemedSound(
  new Sound({
    src: backgroundMusicSound,
    volume: 0.3,
    loop: true,
  }),
  {
    christmas: new Sound({
      src: christmasBackgroundMusicSound,
      volume: 0.25,
      loop: true,
    }),
    halloween: new Sound({
      src: halloweenBackgroundMusicSound,
      volume: 0.3,
      loop: true,
    }),
  },
);

export const waitFinished = new ThemedSound(new Sound({ src: waitFinishedSound, preload: true }), {
  halloween: new Sound({ src: halloweenWaitFinishedSound, preload: true, volume: 0.4 }),
});
export const waitForReadinessMusic = new ThemedSound(new Sound({ src: waitForReadinessSound, volume: 0.8 }), {
  halloween: new Sound({ src: halloweenWaitForReadinessSound, volume: 0.2 }),
});

export const selectHalloweenSong = new Sound({ src: halloweenSelectSongSound, preload: true, volume: 0.5 });
