import { expect, test } from '@playwright/test';

import initialise from './PageObjects/initialise';
import { initTestMode, mockSongs } from './helpers';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const songName = 'New Christmas';
const songID = 'e2e-christmas-english-1995';

test('Hiding and restoring songs works', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();
  await pages.smartphonesConnectionPage.saveAndGoToSing();
  await pages.mainMenuPage.goToManageSongs();
  await pages.manageSongsPage.goToEditSongs();
  await pages.editSongsPage.hideSong(songName, songID);
  await pages.editSongsPage.goToMainMenu();
  await pages.mainMenuPage.goToSingSong();
  await pages.songLanguagesPage.continueAndGoToSongList();

  await expect(page.getByTestId(`song-${songID}`)).not.toBeVisible();

  await page.goBack();
  await page.goBack();
  await pages.mainMenuPage.goToManageSongs();
  await pages.manageSongsPage.goToEditSongs();
  await pages.editSongsPage.restoreSong(songName, songID);
  await pages.editSongsPage.goToMainMenu();
  await pages.mainMenuPage.goToSingSong();

  await expect(page.getByTestId(`song-${songID}`)).toBeVisible();
});
