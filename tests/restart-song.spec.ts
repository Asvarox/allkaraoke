import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const songID = 'e2e-multitrack-polish-1994';

test('should restart the song and the scores', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectAdvancedSetup();
  await pages.advancedConnectionPage.saveAndGoToSing();
  await pages.mainMenuPage.goToSingSong();
  await pages.songLanguagesPage.continueAndGoToSongList();
  await expect(pages.songListPage.getSongElement(songID)).toBeVisible();
  await pages.songListPage.navigateToSongWithKeyboard(songID);
  await page.keyboard.press('Enter');
  await pages.songPreviewPage.goNext();
  await pages.songPreviewPage.playTheSong();
  await pages.gamePage.waitForPlayersScoreToBeGreaterThan(100);

  await page.keyboard.press('Backspace');
  await pages.gamePage.restartSong();
  await pages.gamePage.expectPlayersScoreToBe(0);
});
