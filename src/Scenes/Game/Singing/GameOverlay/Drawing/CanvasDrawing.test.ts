import { createCanvas } from 'canvas';
import { GAME_MODE, NotesSection, Song } from 'interfaces';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import getSongBeatLength from 'Scenes/Game/Singing/GameState/Helpers/getSongBeatLength';
import DrawingTestInput from 'Scenes/Game/Singing/Input/DrawingTestInput';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import pitchToFrequency from 'Utils/pitchToFrequency';
import CanvasDrawing from './CanvasDrawing';
import songFixture from './song-fixture';

const FPS = 30;

const timeFromBeat = (song: Song, beat: number) => song.gap + beat * getSongBeatLength(song);

describe('CanvasDrawing', function () {
    beforeEach(() => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789);

        GameState.setSingSetup({
            playerTracks: [0, 1],
            mode: GAME_MODE.DUEL,
            tolerance: 2,
        });

        InputManager.setPlayerInput(0, DrawingTestInput, 0);
        InputManager.setPlayerInput(1, DrawingTestInput, 1);
    });

    afterEach(() => {
        jest.spyOn(global.Math, 'random').mockRestore();
    });

    const canvas = createCanvas(800, 600);
    const canvasDrawing = new CanvasDrawing(canvas as any);
    GameState.setSong(songFixture);
    InputManager.setPlayerInput(0, DrawingTestInput, 0);
    InputManager.setPlayerInput(1, DrawingTestInput, 1);

    it('Should properly draw game state', () => {
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
            comparisonMethod: 'ssim',
            failureThreshold: 0.01,
            failureThresholdType: 'percent',
        });
    });

    it('should draw missed note above the target note if the distance is positive', function () {
        const p1note = (songFixture.tracks[0].sections[0] as NotesSection).notes[0];
        const p2note = (songFixture.tracks[1].sections[0] as NotesSection).notes[0];

        GameState.setCurrentTime(timeFromBeat(songFixture, p1note.start));
        const targetTime = timeFromBeat(songFixture, p1note.start + p1note.length);

        DrawingTestInput.setFrequency(0, pitchToFrequency(p1note.pitch + 3));
        DrawingTestInput.setFrequency(1, pitchToFrequency(p2note.pitch - 3));

        for (let i = 0; GameState.getCurrentTime(false) < targetTime; i++) {
            GameState.setCurrentTime(GameState.getCurrentTime(false) + (1000 / FPS) * 2);
            GameState.update();
            canvasDrawing.drawFrame();
        }

        expect(canvas.toBuffer()).toMatchImageSnapshot({
            comparisonMethod: 'ssim',
            failureThreshold: 0.01,
            failureThresholdType: 'percent',
        });
    });
});
