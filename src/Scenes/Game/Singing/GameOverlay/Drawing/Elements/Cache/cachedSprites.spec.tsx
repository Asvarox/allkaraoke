import { expect, test } from '@playwright/experimental-ct-react';
import { TestCanvas } from '../../../../../../../utils/TestCanvas';

test.use({ viewport: { width: 57, height: 872 } });

test('Should draw a proper sprite map', async ({ mount, page }) => {
  const component = await mount(<TestCanvas width={1} height={1} />);

  await page.evaluate(() => {
    const { getSprite } = window.CanvasTestApi.Elements;
    const { canvas } = getSprite('p1Miss', 'start');

    document.getElementById('root')!.prepend(canvas);
  });

  await expect(await component.screenshot()).toMatchSnapshot('proper-sprite-map.png', { maxDiffPixelRatio: 0.005 });
});

test('Should return proper coordinates to draw a legit note', async ({ mount, page }) => {
  await page.setViewportSize({ width: 100, height: 100 });
  const component = await mount(<TestCanvas width={100} height={100} />);

  await page.evaluate(() => {
    const { drawSprite } = window.CanvasTestApi.Elements;
    const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    const start = drawSprite(ctx, 'p0Hit', 'start', 10, 10);
    drawSprite(ctx, 'p0Hit', 'middle', 10 + start.w, 10, 40);
    drawSprite(ctx, 'p0Hit', 'end', 10 + start.w + 40, 10);
  });

  await expect(await component.screenshot()).toMatchSnapshot('proper-legit-note.png', { maxDiffPixelRatio: 0.005 });
});

test('Should return proper coordinates to draw a legit small note', async ({ mount, page }) => {
  await page.setViewportSize({ width: 100, height: 100 });
  const component = await mount(<TestCanvas width={100} height={100} />);

  await page.evaluate(() => {
    const { drawSprite } = window.CanvasTestApi.Elements;
    const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    const start = drawSprite(ctx, 'p0Miss', 'start', 10, 10);
    drawSprite(ctx, 'p0Miss', 'middle', 10 + start.w, 10, 40);
    drawSprite(ctx, 'p0Miss', 'end', 10 + start.w + 40, 10);
  });

  await expect(await component.screenshot()).toMatchSnapshot('proper-legit-small-note.png', {
    maxDiffPixelRatio: 0.005,
  });
});
