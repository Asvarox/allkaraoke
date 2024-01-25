import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const expectedLanguage = 'Polish';
const expectedSongID = 'e2e-skip-intro-polish';

test('skip the intro from the song', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectAdvancedSetup();
  await pages.advancedConnectionPage.saveAndGoToSing();
  await pages.mainMenuPage.goToSingSong();

  await expect(pages.songLanguagesPage.getLanguageEntry(expectedLanguage)).toBeVisible();
  await pages.songLanguagesPage.continueAndGoToSongList();

  await expect(pages.songListPage.getSongElement(expectedSongID)).toBeVisible();
  await pages.songListPage.navigateToSongWithKeyboard(expectedSongID);
  await page.keyboard.press('Enter'); // enter first song

  await pages.songPreviewPage.goNext();
  await pages.songPreviewPage.playTheSong();

  await pages.gamePage.skipIntro();
  await pages.postGameResultsPage.skipScoresAnimation();
});
