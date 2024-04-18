import { expect, Page, test } from '@playwright/test';
import _ from 'lodash';
import tuple from 'utils/tuple';

const findInMatrix = (matrix: string[][], name: string): [number, number] => {
  const y = matrix.findIndex((row) => row.includes(name));
  const x = matrix[y].indexOf(name);

  return [x, y];
};

type dirs = 'Up' | 'Down' | 'Left' | 'Right';
const addSteps = (start: [number, number], steps: Array<[number, number, dirs]>, dir: dirs, num: number) => {
  let last = steps[steps.length - 1] ?? start;
  const xChange = dir === 'Left' ? -1 : dir === 'Right' ? 1 : 0;
  const yChange = dir === 'Up' ? -1 : dir === 'Down' ? 1 : 0;
  for (let i = 0; i < num; i++) {
    const step = tuple([last[0] + xChange, last[1] + yChange, dir]);
    steps.push(step);
    last = step;
  }
};

// Possibly an overkill (but fun)?
export default async function navigateWithKeyboard(page: Page, targetTestId: string, remoteMic?: Page) {
  await test.step(`Use ${remoteMic ? 'remote ' : ''}keyboard to navigate to ${targetTestId}`, async () => {
    await expect(page.getByTestId(targetTestId)).toBeVisible();
    const navigableElements = await page.locator('[data-focused]:not([data-unfocusable])');
    const handles = await navigableElements.elementHandles();

    let rectangles = await Promise.all(
      handles.map(async (handle) => {
        return [handle, (await handle.boundingBox())!] as const;
      }),
    );

    // Matrix of navigable elements -- the value is data-test
    const rows: string[][] = [];

    while (rectangles.length) {
      const base = rectangles.pop()!;
      const [, rect] = base;
      const middlePointY = rect.y + rect.height / 2;

      // get all elements whose left side is on the same Y-plane as the "middle" of the compared element
      const [row, rest] = _.partition(rectangles, ([, rectangle]) => {
        return middlePointY < rectangle.y + rectangle.height && middlePointY > rectangle.y;
      });
      rows.push(await Promise.all([...row, base].map(async ([element]) => (await element.getAttribute('data-test'))!)));
      rectangles = rest;
    }
    // we started from the bottom (last) elements
    rows.reverse();

    const startingElement = (await (await page.locator('[data-focused="true"]')).getAttribute('data-test'))!;
    const start = findInMatrix(rows, startingElement);
    const [finishX, finishY] = findInMatrix(rows, targetTestId);

    const intermediateSteps: Array<[number, number, dirs]> = [];
    if (start[0] > 0) {
      // Move to the first element in the row
      addSteps(start, intermediateSteps, 'Left', start[0]);
    }
    if (start[1] < finishY) {
      // Move down to the target row
      addSteps(start, intermediateSteps, 'Down', finishY - start[1]);
    } else if (start[1] > finishY) {
      // Move up to the target row
      addSteps(start, intermediateSteps, 'Up', start[1] - finishY);
    }
    if (finishX > 0) {
      // Move to the target element
      addSteps(start, intermediateSteps, 'Right', finishX);
    }

    for (const [x, y, dir] of intermediateSteps) {
      // Execute the steps
      if (remoteMic) {
        await remoteMic.getByTestId(`arrow-${dir.toLowerCase()}`).click();
      } else {
        await page.keyboard.press(`Arrow${dir}`);
      }
      await expect(page.getByTestId(rows[y][x])).toHaveAttribute('data-focused', 'true');
    }
  });
}
