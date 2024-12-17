import { expect, test } from '@playwright/test';

import initialise from './PageObjects/initialise';
import { initTestMode, mockSongs } from './helpers';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});
const song = {
  ID: 'e2e-christmas-english-1995',
  language: 'English',
};

test('Hiding and restoring songs works', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Select Smartphones setup', async () => {
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectSmartphones();
    await pages.smartphonesConnectionPage.goToMainMenu();
  });

  await test.step('Ensure song language is selected', async () => {
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToSelectSongLanguage();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(song.language);
    await pages.songLanguagesPage.goBackToMainMenu();
  });

  await test.step('Go to Edit Songs Page', async () => {
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToEditSongs();
  });

  await test.step('The song, after hiding, should not be visible in song list', async () => {
    await pages.editSongsPage.hideSong(song.ID);
    await pages.editSongsPage.goToMainMenu();
    await pages.mainMenuPage.goToSingSong();
    await expect(await pages.songListPage.getSongElement(song.ID)).not.toBeVisible();
  });

  await test.step('Go back to Edit Songs Page', async () => {
    await pages.songListPage.goBackToMainMenu();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToEditSongs();
  });

  await test.step('After restoring, the song should be visible again in song list', async () => {
    await pages.editSongsPage.restoreSong(song.ID);
    await pages.editSongsPage.goToMainMenu();
    await pages.mainMenuPage.goToSingSong();
    await expect(await pages.songListPage.getSongElement(song.ID)).toBeVisible();
  });
});
