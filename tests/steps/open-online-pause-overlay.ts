import { expect, Page } from '@playwright/test';

/**
 * Presses Escape on `pausingPage` until `checkPage`'s pause overlay is visible. In Firefox the
 * first Escape sometimes isn't registered by the game, so this retries rather than pressing once.
 */
export async function openOnlinePauseOverlay(pausingPage: Page, checkPage: Page = pausingPage) {
  await expect(async () => {
    if (!(await checkPage.getByTestId('online-pause-overlay').isVisible())) {
      await pausingPage.keyboard.press('Escape');
    }
    await expect(checkPage.getByTestId('online-pause-overlay')).toBeVisible({ timeout: 3_000 });
  }).toPass({ timeout: 20_000 });
}
