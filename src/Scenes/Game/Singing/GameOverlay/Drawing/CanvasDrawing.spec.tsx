import { expect, test } from '@playwright/experimental-ct-react';
import { mulitrack } from 'Songs/utils/song-fixture';
import { NotesSection } from 'interfaces';
import tuple from 'utils/tuple';
import { TestCanvas } from '../../../../../utils/TestCanvas';

test.use({ viewport: { width: 800, height: 650 } });

test('Should properly draw game state', async ({ mount, page }) => {
  const component = await mount(<TestCanvas width={800} height={650} />);

  await page.evaluate(() => {
    const { CanvasDrawing, GameState, DrawingTestInput } = window.CanvasTestApi;
    window.Math.random = () => 0.75;

    const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
    const canvasDrawing = new CanvasDrawing(canvas);
    const CHANNEL2_VALUES = [410, 413, 416, 413, 410, 407, 404, 407];
    const DRAWN_SECONDS = 2.5;
    const FPS = 30;

    for (let i = 0; i < FPS * DRAWN_SECONDS; i++) {
      const currentTime = i * (1000 / FPS);
      window.Date.now = () => currentTime;
      GameState.setCurrentTime(currentTime);
      DrawingTestInput.setFrequency(0, 440);
      DrawingTestInput.setFrequency(1, CHANNEL2_VALUES[i % CHANNEL2_VALUES.length]);
      GameState.update();
      canvasDrawing.drawFrame();
    }
  });

  await expect(await component.screenshot()).toMatchSnapshot({ maxDiffPixelRatio: 0.005 });
});

test('should draw missed note above the target note if the distance is positive', async ({ mount, page }) => {
  const component = await mount(<TestCanvas width={800} height={650} />);

  await page.evaluate(
    ([mulitrack]) => {
      const { CanvasDrawing, GameState, DrawingTestInput, utils } = window.CanvasTestApi;
      window.Math.random = () => 0.75;

      const FPS = 30;

      const p1note = (mulitrack.tracks[0].sections[0] as NotesSection).notes[0];
      const p2note = (mulitrack.tracks[1].sections[0] as NotesSection).notes[0];

      const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
      const canvasDrawing = new CanvasDrawing(canvas);

      GameState.setCurrentTime(utils.beatToMs(p1note.start, mulitrack));
      const targetTime = utils.beatToMs(p1note.start + p1note.length, mulitrack);

      DrawingTestInput.setFrequency(0, utils.pitchToFrequency(p1note.pitch + 3));
      DrawingTestInput.setFrequency(1, utils.pitchToFrequency(p2note.pitch - 3));

      for (let i = 0; GameState.getCurrentTime(false) < targetTime; i++) {
        GameState.setCurrentTime(GameState.getCurrentTime(false) + (1000 / FPS) * 2);
        GameState.update();
        canvasDrawing.drawFrame();
      }
    },
    tuple([mulitrack]),
  );

  // Expected - red should be below, blue above the target note
  await expect(await component.screenshot()).toMatchSnapshot({ maxDiffPixelRatio: 0.005 });
});
