import { Howl } from 'howler';

import menuBackSound from './menu_back.wav';
import menuEnterSound from './menu_enter.wav';
import menuNavigateSound from './menu_navigate.wav';
import waitFinishedSound from 'assets/376817__original_sound__impact-cinematic.wav';

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

export { menuNavigate, menuEnter, menuBack, waitFinished };
