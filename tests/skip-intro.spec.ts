import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import navigateWithKeyboard from './steps/navigateWithKeyboard';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test('skip the intro from the song', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await page.getByTestId('advanced').click();
  await page.getByTestId('save-button').click();

  await page.getByTestId('sing-a-song').click();
  await expect(page.getByTestId('lang-Polish')).toBeVisible();
  await page.getByTestId('close-exclude-languages').click();

  await expect(page.getByTestId('song-e2e-skip-intro-polish')).toBeVisible();
  await navigateWithKeyboard(page, 'song-e2e-skip-intro-polish');
  await page.keyboard.press('Enter'); // enter first song

  await page.getByTestId('next-step-button').click();
  await page.getByTestId('play-song-button').click();

  await page.waitForTimeout(1500);
  await expect(page.getByTestId('skip-intro-info')).toBeVisible();
  await page.waitForTimeout(1500);
  await page.keyboard.press('Enter');

  await page.getByTestId('skip-animation-button').click({ timeout: 20_000 });
});
