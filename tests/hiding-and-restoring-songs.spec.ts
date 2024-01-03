import { expect, test } from '@playwright/test';

import initialise from './PageObjects/initialise';
import { initTestMode, mockSongs } from './helpers';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const songName: string = 'New Christmas';

test('Hiding and restoring songs works', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  //TestID = data-test
  await page.getByTestId('remote-mics').click();
  await page.getByTestId('save-button').click();
  await page.getByTestId('manage-songs').click();
  await page.getByTestId('edit-songs').click();
  await page.locator("input[placeholder='Search']").fill(songName);
  await page.locator("button[data-test='hide-song'][data-song='e2e-christmas-english-1995']").click();
  await page.getByTestId('main-menu-link').click();
  await page.getByTestId('sing-a-song').click();
  await page.getByTestId('close-exclude-languages').click();

  await expect(page.getByTestId('song-e2e-christmas-english-1995')).not.toBeVisible();

  await page.goBack();
  await page.goBack();
  await page.getByTestId('manage-songs').click();
  await page.getByTestId('edit-songs').click();
  await page.locator("input[placeholder='Search']").fill(songName);
  await page.locator("button[data-test='restore-song'][data-song='e2e-christmas-english-1995']").click();
  await page.getByTestId('main-menu-link').click();
  await page.getByTestId('sing-a-song').click();

  await expect(page.getByTestId('song-e2e-christmas-english-1995')).toBeVisible();
});
