import { page } from 'vitest/browser';

import { drawSprite, getSprite } from '~/modules/game-engine/drawing/elements/cache/cached-sprites';
import spriteMap from '~/modules/game-engine/drawing/elements/cache/sprite-map';
import { renderTestCanvas } from '~/modules/utils/render-test-canvas';

test('Should draw a proper sprite map', async () => {
  const MAX_COLUMN_HEIGHT = 600;
  await page.viewport(400, MAX_COLUMN_HEIGHT);
  await renderTestCanvas({ width: 1, height: 1 });

  const { canvas: spriteCanvas } = getSprite('p1Miss', 'start');

  // The sprite map is too tall to fit the test iframe (anything past its viewport is cut off from the
  // screenshot), so it's laid out in columns, split only between sprites
  const columns: Array<Array<{ y: number; h: number }>> = [[]];
  let y = 0;
  let columnHeight = 0;
  for (const sprite of Object.values(spriteMap)) {
    const h = sprite.height + sprite.padding * 2;
    if (columnHeight + h > MAX_COLUMN_HEIGHT) {
      columns.push([]);
      columnHeight = 0;
    }
    columns.at(-1)!.push({ y, h });
    y += h;
    columnHeight += h;
  }

  const grid = document.createElement('canvas');
  grid.width = spriteCanvas.width * columns.length;
  grid.height = Math.max(...columns.map((column) => column.reduce((sum, sprite) => sum + sprite.h, 0)));
  const ctx = grid.getContext('2d')!;
  columns.forEach((column, index) => {
    let destY = 0;
    for (const sprite of column) {
      ctx.drawImage(
        spriteCanvas,
        0,
        sprite.y,
        spriteCanvas.width,
        sprite.h,
        index * spriteCanvas.width,
        destY,
        spriteCanvas.width,
        sprite.h,
      );
      destY += sprite.h;
    }
  });
  document.body.prepend(grid);

  await expect
    .element(page.elementLocator(grid))
    .toMatchScreenshot('proper-sprite-map', { comparatorOptions: { allowedMismatchedPixelRatio: 0.005 } });
});

test('Should return proper coordinates to draw a legit note', async () => {
  await page.viewport(100, 100);
  const { ctx, locator } = await renderTestCanvas({ width: 100, height: 100 });

  const start = drawSprite(ctx, 'p0Hit', 'start', 10, 10);
  drawSprite(ctx, 'p0Hit', 'middle', 10 + start.w, 10, 40);
  drawSprite(ctx, 'p0Hit', 'end', 10 + start.w + 40, 10);

  await expect
    .element(locator)
    .toMatchScreenshot('proper-legit-note', { comparatorOptions: { allowedMismatchedPixelRatio: 0.005 } });
});

test('Should return proper coordinates to draw a legit small note', async () => {
  await page.viewport(100, 100);
  const { ctx, locator } = await renderTestCanvas({ width: 100, height: 100 });

  const start = drawSprite(ctx, 'p0Miss', 'start', 10, 10);
  drawSprite(ctx, 'p0Miss', 'middle', 10 + start.w, 10, 40);
  drawSprite(ctx, 'p0Miss', 'end', 10 + start.w + 40, 10);

  await expect
    .element(locator)
    .toMatchScreenshot('proper-legit-small-note', { comparatorOptions: { allowedMismatchedPixelRatio: 0.005 } });
});
