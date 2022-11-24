import { createCanvas } from 'canvas';
import { GAME_MODE, NotesSection, Song } from 'interfaces';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import getSongBeatLength from 'Songs/utils/getSongBeatLength';
import DrawingTestInput from 'Scenes/Game/Singing/Input/DrawingTestInput';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import pitchToFrequency from 'utils/pitchToFrequency';
import { mulitrack } from 'Songs/utils/song-fixture';
import CanvasDrawing from './CanvasDrawing';

const FPS = 30;

const timeFromBeat = (song: Song, beat: number) => song.gap + beat * getSongBeatLength(song);

describe('CanvasDrawing', function () {
    beforeEach(() => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789);

        GameState.setSingSetup({
            id: 'tests',
            players: [
                { name: 'Player 1', track: 0 },
                { name: 'Player 2', track: 1 },
            ],
            mode: GAME_MODE.DUEL,
            tolerance: 2,
        });

        InputManager.setPlayerInput(0, 'DrawingTest', 0);
        InputManager.setPlayerInput(1, 'DrawingTest', 1);
    });

    afterEach(() => {
        jest.spyOn(global.Math, 'random').mockRestore();
    });

    const canvas = createCanvas(800, 600);
    const canvasDrawing = new CanvasDrawing(canvas as any);
    GameState.setSong(mulitrack);
    InputManager.setPlayerInput(0, 'DrawingTest', 0);
    InputManager.setPlayerInput(1, 'DrawingTest', 1);

    jest.retryTimes(2);
    // todo fix the test failing on CI/CD (it's drawing rectangles there)
    it.skip('Should properly draw game state', () => {
        const CHANNEL2_VALUES = [410, 413, 416, 413, 410, 407, 404, 407];

        const DRAWN_SECONDS = 4;

        for (let i = 0; i < FPS * DRAWN_SECONDS; i++) {
            GameState.setCurrentTime(i * (1000 / FPS));
            DrawingTestInput.setFrequency(0, 440);
            DrawingTestInput.setFrequency(1, CHANNEL2_VALUES[i % CHANNEL2_VALUES.length]);
            GameState.update();
            canvasDrawing.drawFrame();
        }

        expect(canvas.toBuffer()).toMatchImageSnapshot({
            customSnapshotIdentifier: 'Should properly draw game state',
            comparisonMethod: 'ssim',
            failureThreshold: 0.01,
            failureThresholdType: 'percent',
        });
    });

    jest.retryTimes(2);
    it('should draw missed note above the target note if the distance is positive', function () {
        const p1note = (mulitrack.tracks[0].sections[0] as NotesSection).notes[0];
        const p2note = (mulitrack.tracks[1].sections[0] as NotesSection).notes[0];

        GameState.setCurrentTime(timeFromBeat(mulitrack, p1note.start));
        const targetTime = timeFromBeat(mulitrack, p1note.start + p1note.length);

        DrawingTestInput.setFrequency(0, pitchToFrequency(p1note.pitch + 3));
        DrawingTestInput.setFrequency(1, pitchToFrequency(p2note.pitch - 3));

        for (let i = 0; GameState.getCurrentTime(false) < targetTime; i++) {
            GameState.setCurrentTime(GameState.getCurrentTime(false) + (1000 / FPS) * 2);
            GameState.update();
            canvasDrawing.drawFrame();
        }

        expect(canvas.toBuffer()).toMatchImageSnapshot({
            customSnapshotIdentifier: 'should draw missed note above the target note if the distance is positive',
            comparisonMethod: 'ssim',
            failureThreshold: 0.01,
            failureThresholdType: 'percent',
        });
    });
});
