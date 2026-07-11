import { expect } from '@playwright/test';
import { mockRandom } from '../helpers';
import { visual } from './visual';

visual('Mic setup', async ({ page, context, makeScreenshot }) => {
  // The remote-mic game code (shown as text + QR in the "Remote mics" and "Advanced" screens) is randomly
  // generated - mock Math.random so it's deterministic and the screenshots are stable across runs.
  await mockRandom({ page, context });

  await page.goto('/select-input/?e2e-test');
  await expect(page.getByTestId('advanced')).toBeVisible();
  await makeScreenshot('hub');

  await page.getByTestId('built-in').click();
  // Audibility detection takes a moment and changes the layout (extra "setup completed" state) once
  // done - wait for it to settle so the screenshot doesn't race it.
  await expect(page.getByText('Microphone is audible')).toBeVisible();
  await makeScreenshot('built-in');
  await page.getByTestId('back-button').click();

  await page.getByTestId('advanced').click();
  await expect(page.getByTestId('player-0-source')).toBeVisible();
  await makeScreenshot('advanced');
  await page.getByTestId('back-button').click();

  await page.getByTestId('remote-mics').click();
  // 'game-code' is hidden below 560px width, where a compact QR-only layout is shown instead
  await expect(page.getByTestId('back-button')).toBeVisible();
  await makeScreenshot('remote-mics');
});
