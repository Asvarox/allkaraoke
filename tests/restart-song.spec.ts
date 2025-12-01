import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const song = {
  ID: 'e2e-multitrack-polish-1994',
  language: 'Polish',
} as const;

test('should restart the song and the scores', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Select Advanced setup', async () => {
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectAdvancedSetup();
    await pages.advancedConnectionPage.goToMainMenu();
  });

  await test.step('Ensure song language is selected', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureLanguageToBeSelected(song.language);
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Choose the song', async () => {
    await expect(await pages.songListPage.getSongElement(song.ID)).toBeVisible();
    await pages.songListPage.ensureSongToBeSelected(song.ID);
    await pages.songListPage.approveSelectedSongByKeyboard();
  });

  await test.step('Go to play the song', async () => {
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.playTheSong();
    await pages.gamePage.waitForPlayersScoreToBeGreaterThan(100);
  });

  await test.step('After restarting, the song should be played from the beginning - with score 0', async () => {
    await pages.gamePage.openPauseMenuAndRestartSong();
    await pages.gamePage.expectPlayersCoopScoreValueToBe(0);
  });
});
