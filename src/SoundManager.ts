import { Howl } from 'howler';

const menuNavigateSound = require('./menu_navigate.wav');
const menuEnterSound = require('./menu_enter.wav');
const menuBackSound = require('./menu_back.wav');

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
