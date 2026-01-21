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

  await test.step('Go to Jukebox', async () => {
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToJukebox();
  });

  await test.step('Skip the song - the jukebox should display next song', async () => {
    const previousSong = await pages.jukeboxPage.currentSongName;
    await pages.jukeboxPage.navigateToSkipSongByKeyboard();
    await pages.jukeboxPage.expectCurrentSongNotToBe(previousSong!);
  });

  await test.step('After click to sing a song, that song should appear as a preview in the song list', async () => {
    const expectedSong = await pages.jukeboxPage.currentSongName;
    await pages.jukeboxPage.navigateToSingSongByKeyboard();
    await pages.songLanguagesPage.ensureAllLanguagesToBe('selected');
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.songListPage.expectSelectedSongToBe(expectedSong!);
  });
});
