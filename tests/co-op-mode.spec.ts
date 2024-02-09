import { expect, test } from '@playwright/test';
import initialise from './PageObjects/initialise';
import { initTestMode, mockSongs } from './helpers';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const polishLang = 'Polish';
const polSong = 'e2e-multitrack-polish-1994';
const gameMode = 'Cooperation';
const blueMicNum = 0;
const redMicNum = 1;
const player1Name = 'Player #1';
const player2Name = 'Player #2';

test('Cooperation mode', async ({ page, browserName }, testInfo) => {
  test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectAdvancedSetup();
  await pages.advancedConnectionPage.saveAndGoToSing();
  await pages.mainMenuPage.goToSingSong();

  await test.step('Make sure song language is selected', async () => {
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(polishLang);
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Navigate to song', async () => {
    await expect(pages.songListPage.getSongElement(polSong)).toBeVisible();
    await pages.songListPage.navigateToSongWithKeyboard(polSong);
    await pages.songListPage.approveSelectedSongByKeyboard();
    await expect(pages.songPreviewPage.nextButton).toBeVisible();
  });

  await test.step('Set Cooperation game mode and navigate to song', async () => {
    await pages.songPreviewPage.expectGameModeToBe(gameMode);
    await pages.songPreviewPage.navigateToGoNextWithKeyboard();
    await pages.songPreviewPage.navigateToPlayTheSongWithKeyboard();
  });

  await test.step('Players cooperation score is visible', async () => {
    await expect(pages.gamePage.playersCoopScoreElement).toBeVisible({ timeout: 15_000 });
    await expect(pages.gamePage.getPlayerScoreElement(blueMicNum)).not.toBeVisible();
    await expect(pages.gamePage.getPlayerScoreElement(redMicNum)).not.toBeVisible();
  });

  await test.step('Names of cooperating players are visible', async () => {
    await expect(pages.postGameResultsPage.playersNamesCoopElement).toBeVisible({ timeout: 30_000 });
    await pages.postGameResultsPage.expectPlayersNamesCoopToBeDisplayed(player1Name, player2Name);
    await expect(pages.postGameResultsPage.getPlayerNameElement(redMicNum)).not.toBeVisible();
  });

  await test.step('Skip to high scores - players names are visible', async () => {
    await expect(pages.postGameResultsPage.skipScoreElement).toBeVisible();
    await pages.postGameResultsPage.waitForPlayersScoreToBeGreaterThan(100);
    await pages.postGameResultsPage.skipScoresAnimation();
    await pages.postGameResultsPage.goToPostGameHighScoresStep();
    await expect(pages.postGameHighScoresPage.getPlayersNamesCoopInput(player1Name, player2Name)).toBeVisible();
  });
});
