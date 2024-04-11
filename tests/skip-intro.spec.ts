import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const player1 = 0;
const player2 = 1;

const song = {
  ID: 'e2e-skip-intro-polish',
  language: 'Polish',
};

test('skip the intro from the song', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Select Advanced setup', async () => {
    await pages.inputSelectionPage.selectAdvancedSetup();
    await pages.advancedConnectionPage.goToMainMenu();
  });

  await test.step('Ensure song language is selected', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(song.language);
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Choose the song and play it', async () => {
    await expect(pages.songListPage.getSongElement(song.ID)).toBeVisible();
    await pages.songListPage.focusSong(song.ID);
    await pages.songListPage.approveSelectedSongByKeyboard();
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.playTheSong();
  });

  await test.step('When skip intro - player goes to the sung part of the song', async () => {
    await expect(pages.gamePage.skipIntroElement).toBeVisible();
    await pages.gamePage.skipIntroIfPossible();
    await expect(pages.gamePage.skipIntroElement).toBeVisible({ timeout: 6_000 });
    await expect(pages.gamePage.getSongLyricsForPlayerElement(player1)).toBeVisible();
    await expect(pages.gamePage.getSongLyricsForPlayerElement(player2)).toBeVisible();
    await pages.postGameResultsPage.skipScoresAnimation();
  });
});
