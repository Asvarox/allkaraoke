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
const language = 'English';

test('Hiding and restoring songs works', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();
  await pages.smartphonesConnectionPage.goToMainMenu();
  await pages.mainMenuPage.goToManageSongs();
  await pages.manageSongsPage.goToEditSongs();
  await pages.editSongsPage.hideSong(songID);
  await pages.editSongsPage.goToMainMenu();
  await pages.mainMenuPage.goToSingSong();
  await pages.songLanguagesPage.ensureSongLanguageIsSelected(language);
  await pages.songLanguagesPage.continueAndGoToSongList();
  await expect(pages.songListPage.getSongElement(songID)).not.toBeVisible();

  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await pages.mainMenuPage.goToManageSongs();
  await pages.manageSongsPage.goToEditSongs();
  await pages.editSongsPage.restoreSong(songID);
  await pages.editSongsPage.goToMainMenu();
  await pages.mainMenuPage.goToSingSong();
  await expect(pages.songListPage.getSongElement(songID)).toBeVisible();
});
