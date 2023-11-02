import { expect, test } from '@playwright/test';
import navigateWithKeyboard from './steps/navigateWithKeyboard';

test('Jukebox', async ({ page }) => {
  await page.goto('/?e2e-test');
  await page.getByTestId('enter-the-game').click();
  await page.getByTestId('skip').click();

  await page.getByTestId('jukebox').click();

  await expect(page.getByTestId('skip-button')).toBeVisible();
  await navigateWithKeyboard(page, 'skip-button');
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  const selectedSong = await page.getByTestId('jukebox-container').getAttribute('data-song');

  await navigateWithKeyboard(page, 'sing-button');
  await page.keyboard.press('Enter'); // Sing this song
  await expect(page.getByTestId('lang-Polish')).toBeVisible();
  await page.waitForTimeout(500);
  await page.getByTestId('close-exclude-languages').click();
  await expect(page.getByTestId('song-list-container')).toBeVisible();
  await expect(page.getByTestId('song-preview')).toHaveAttribute('data-song', selectedSong!);
});
