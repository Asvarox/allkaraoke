import { Howl } from 'howler';

import menuBackSound from './menu_back.wav';
import menuEnterSound from './menu_enter.wav';
import menuNavigateSound from './menu_navigate.wav';

const menuNavigate = new Howl({
    src: menuNavigateSound,
});

const menuEnter = new Howl({
    src: menuEnterSound,
});

const menuBack = new Howl({
    src: menuBackSound,
});

export { menuNavigate, menuEnter, menuBack };
