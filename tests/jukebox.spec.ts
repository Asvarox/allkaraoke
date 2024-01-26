import { test } from '@playwright/test';

import initialise from './PageObjects/initialise';
import { initTestMode } from './helpers';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
});

test('Jukebox', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.skipToMainMenu();
  await pages.mainMenuPage.goToJukebox();

  const previousSong = await pages.jukeboxPage.currentSongName;
  await pages.jukeboxPage.navigateToSkipSongByKeyboard();
  await pages.jukeboxPage.expectCurrentSongNotToBe(previousSong!);

  const expectedSong = await pages.jukeboxPage.currentSongName;
  await pages.jukeboxPage.navigateToSingSongByKeyboard();
  await pages.songLanguagesPage.continueAndGoToSongList();
  await pages.songListPage.expectSelectedSongToBe(expectedSong!);
});
