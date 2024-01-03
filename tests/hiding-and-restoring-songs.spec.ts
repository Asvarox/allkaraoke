import { expect, test } from '@playwright/test';

import initialise from './PageObjects/initialise';
import { initTestMode, mockSongs } from './helpers';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const songID = 'e2e-christmas-english-1995';
const songName = 'New Christmas';

test('Hiding and restoring songs works', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await page.getByTestId('remote-mics').click();
  await page.getByTestId('save-button').click();
  await page.getByTestId('manage-songs').click();
  await page.getByTestId('edit-songs').click();
  await page.locator("input[placeholder='Search']").fill(songName);
  await page.locator(`button[data-test='hide-song'][data-song='${songID}']`).click();
  await page.getByTestId('main-menu-link').click();
  await page.getByTestId('sing-a-song').click();
  await page.getByTestId('close-exclude-languages').click();

  await expect(page.getByTestId(`song-${songID}`)).not.toBeVisible();

  await page.goBack();
  await page.goBack();
  await page.getByTestId('manage-songs').click();
  await page.getByTestId('edit-songs').click();
  await page.locator("input[placeholder='Search']").fill(songName);
  await page.locator(`button[data-test='restore-song'][data-song='${songID}']`).click();
  await page.getByTestId('main-menu-link').click();
  await page.getByTestId('sing-a-song').click();

  await expect(page.getByTestId(`song-${songID}`)).toBeVisible();
});
