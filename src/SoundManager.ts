import { Howl } from 'howler';

import cameraSound from 'assets/166500__thompsonman__camera-shutter.wav';
import waitFinishedSound from 'assets/376817__original_sound__impact-cinematic.wav';
import classicBackgroundMusicSound from 'assets/421888__b-sean__retro.mp3';
import backgroundMusicSound from 'assets/Funk Cool Groove (No Copyright Music) By Anwar Amr.mp3';
import menuBackSound from 'assets/menu_back.wav';
import menuEnterSound from 'assets/menu_enter.wav';
import menuNavigateSound from 'assets/menu_navigate.wav';

const menuNavigate = new Howl({
    src: menuNavigateSound,
});

const menuEnter = new Howl({
    src: menuEnterSound,
});

const menuBack = new Howl({
    src: menuBackSound,
});

const waitFinished = new Howl({
    src: waitFinishedSound,
    preload: true,
});

const cameraShot = new Howl({
    src: cameraSound,
    preload: true,
    volume: 0.1,
});

const backgroundMusic = new Howl({
    src: backgroundMusicSound,
    volume: 0.3,
    loop: true,
});
const classicBackgroundMusic = new Howl({
    src: classicBackgroundMusicSound,
    volume: 0.4,
    loop: true,
});

export { backgroundMusic, cameraShot, classicBackgroundMusic, menuBack, menuEnter, menuNavigate, waitFinished };
