import { page } from 'vitest/browser';

import { NotesSection } from '~/interfaces';
import CanvasDrawing from '~/modules/game-engine/drawing/canvas-drawing';
import GameState from '~/modules/game-engine/game-state/game-state';
import beatToMs from '~/modules/game-engine/game-state/helpers/beat-to-ms';
import DrawingTestInput from '~/modules/game-engine/input/drawing-test-input';
import { mulitrack } from '~/modules/songs/utils/song-fixture';
import pitchToFrequency from '~/modules/utils/pitch-to-frequency';
import { renderTestCanvas } from '~/modules/utils/render-test-canvas';

const hasDrawnAnything = (canvas: HTMLCanvasElement) => {
  const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;

  return pixels.some((channelValue, index) => index % 4 !== 3 && channelValue !== 255);
};

beforeEach(async () => {
  await page.viewport(800, 650);
  vi.spyOn(Math, 'random').mockReturnValue(0.75);
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('Should properly draw game state', async () => {
  const { canvas, locator } = await renderTestCanvas({ width: 800, height: 650 });
  expect(GameState.getPlayer(0) && GameState.getPlayer(1)).toBeTruthy();

  const canvasDrawing = new CanvasDrawing(canvas);
  const CHANNEL2_VALUES = [410, 413, 416, 413, 410, 407, 404, 407];
  const DRAWN_SECONDS = 2.5;
  const FPS = 30;

  const now = vi.spyOn(Date, 'now');
  for (let i = 0; i < FPS * DRAWN_SECONDS; i++) {
    const currentTime = i * (1000 / FPS);
    now.mockReturnValue(currentTime);
    GameState.setCurrentTime(currentTime);
    DrawingTestInput.setFrequency(0, 440);
    DrawingTestInput.setFrequency(1, CHANNEL2_VALUES[i % CHANNEL2_VALUES.length]);
    GameState.update();
    canvasDrawing.drawFrame();
  }

  await expect.poll(() => hasDrawnAnything(canvas)).toBe(true);

  await expect
    .element(locator)
    .toMatchScreenshot('game-state', { comparatorOptions: { allowedMismatchedPixelRatio: 0.005 } });
});

test('should draw missed note above the target note if the distance is positive', async () => {
  const { canvas, locator } = await renderTestCanvas({ width: 800, height: 650 });

  const FPS = 30;

  const p1note = (mulitrack.tracks[0].sections[0] as NotesSection).notes[0];
  const p2note = (mulitrack.tracks[1].sections[0] as NotesSection).notes[0];

  const canvasDrawing = new CanvasDrawing(canvas);

  GameState.setCurrentTime(beatToMs(p1note.start, mulitrack));
  const targetTime = beatToMs(p1note.start + p1note.length + 20, mulitrack);

  DrawingTestInput.setFrequency(0, pitchToFrequency(p1note.pitch + 3));
  DrawingTestInput.setFrequency(1, pitchToFrequency(p2note.pitch - 3));

  while (GameState.getCurrentTime(false) < targetTime) {
    GameState.setCurrentTime(GameState.getCurrentTime(false) + (1000 / FPS) * 2);
    GameState.update();
    canvasDrawing.drawFrame();
  }

  await expect.poll(() => hasDrawnAnything(canvas)).toBe(true);

  // Expected - red should be below, blue above the target note
  await expect
    .element(locator)
    .toMatchScreenshot('missed-note-above-target-note', { comparatorOptions: { allowedMismatchedPixelRatio: 0.005 } });
});
