import { page } from 'vitest/browser';

import drawPlayerNote from '~/modules/game-engine/drawing/elements/player-note';
import { renderTestCanvas } from '~/modules/utils/render-test-canvas';
import { generateNote, generatePlayerNote } from '~/modules/utils/test-utils';

test('Should draw a proper note when it is shorter than minimum', async () => {
  await page.viewport(220, 80);
  const { ctx, locator } = await renderTestCanvas({ width: 220, height: 80 });

  const playerNote = generatePlayerNote(generateNote(1), 0);

  drawPlayerNote(ctx, 10, 10, 10, 0, true, playerNote);
  drawPlayerNote(ctx, 50, 10, 30, 0, true, playerNote);
  drawPlayerNote(ctx, 120, 10, 50, 0, true, playerNote);

  await expect
    .element(locator)
    .toMatchScreenshot('short-note', { comparatorOptions: { allowedMismatchedPixelRatio: 0.005 } });
});

test('Should draw multiple notes', async () => {
  await page.viewport(220, 200);
  const { ctx, locator } = await renderTestCanvas({ width: 220, height: 200 });

  const playerNote = generatePlayerNote(generateNote(1), 0);

  drawPlayerNote(ctx, 10, 10, 130, 0, true, playerNote);
  drawPlayerNote(ctx, 20, 80, 130, 1, true, playerNote);

  await expect
    .element(locator)
    .toMatchScreenshot('multiple-notes', { comparatorOptions: { allowedMismatchedPixelRatio: 0.005 } });
});
