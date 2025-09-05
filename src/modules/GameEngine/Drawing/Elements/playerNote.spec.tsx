import { expect, test } from '@playwright/experimental-ct-react';
import { TestCanvas } from '../../../utils/TestCanvas';
import { generateNote, generatePlayerNote } from '../../../utils/testUtils';
import tuple from '../../../utils/tuple';

test.use({ viewport: { width: 220, height: 80 } });

test('Should draw a proper note when it is shorter than minimum', async ({ mount, page }) => {
  await page.setViewportSize({ width: 220, height: 80 });
  const component = await mount(<TestCanvas width={220} height={80} />);

  const note = generateNote(1);
  const playerNote = generatePlayerNote(note, 0);

  await page.evaluate(
    ([playerNote]) => {
      const { drawPlayerNote } = globalThis.canvasTestApi.Elements;
      const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
      const ctx = canvas.getContext('2d')!;

      drawPlayerNote(ctx, 10, 10, 10, 0, true, playerNote);
      drawPlayerNote(ctx, 50, 10, 30, 0, true, playerNote);
      drawPlayerNote(ctx, 120, 10, 50, 0, true, playerNote);
    },
    tuple([playerNote]),
  );

  await expect(await component.screenshot()).toMatchSnapshot({ maxDiffPixelRatio: 0.005 });
});

test('Should draw multiple notes', async ({ mount, page }) => {
  await page.setViewportSize({ width: 220, height: 200 });
  const component = await mount(<TestCanvas width={220} height={200} />);

  const note = generateNote(1);
  const playerNote = generatePlayerNote(note, 0);

  await page.evaluate(
    ([playerNote]) => {
      const { drawPlayerNote } = globalThis.canvasTestApi.Elements;
      const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
      const ctx = canvas.getContext('2d')!;

      drawPlayerNote(ctx, 10, 10, 130, 0, true, playerNote);
      drawPlayerNote(ctx, 20, 80, 130, 1, true, playerNote);
    },
    tuple([playerNote]),
  );

  await expect(await component.screenshot()).toMatchSnapshot({ maxDiffPixelRatio: 0.005 });
});
