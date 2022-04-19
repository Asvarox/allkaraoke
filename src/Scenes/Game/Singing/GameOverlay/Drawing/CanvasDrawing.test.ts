import { createCanvas } from 'canvas';
import { GAME_MODE } from '../../../../../interfaces';
import GameState from '../../GameState/GameState';
import DrawingTestInput from '../../Input/DrawingTestInput';
import InputManager from '../../Input/InputManager';
import CanvasDrawing from './CanvasDrawing';
import songFixture from './song-fixture';

const FPS = 60;

describe('CanvasDrawing', function () {
    beforeEach(() => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789);
    });

    afterEach(() => {
        jest.spyOn(global.Math, 'random').mockRestore();
    });

    const canvas = createCanvas(800, 600);
    const canvasDrawing = new CanvasDrawing(canvas as any);
    GameState.setSong(songFixture);
    GameState.setSingSetup({
        playerTracks: [0, 1],
        mode: GAME_MODE.DUEL,
        tolerance: 2,
    });
    InputManager.setPlayerInput(0, DrawingTestInput, 0);
    InputManager.setPlayerInput(1, DrawingTestInput, 1);

    it('Should properly draw game state', () => {
        for (let i = 0; i < FPS * 4; i++) {
            GameState.setCurrentTime(i * 16.6);
            GameState.update();
            canvasDrawing.drawFrame();
        }

        expect(canvas.toBuffer()).toMatchImageSnapshot();
    });
});
