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

test('Cooperation mode', async ({ page }) => {
  test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Select Advanced setup', async () => {
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectAdvancedSetup();
    await pages.advancedConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToSingSong();
  });

  await test.step('Make sure song language is selected', async () => {
    await pages.songLanguagesPage.ensureLanguageToBeSelected(polishLang);
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Navigate to song', async () => {
    await expect(await pages.songListPage.getSongElement(polSong)).toBeVisible();
    await pages.songListPage.ensureSongToBeSelected(polSong);
    await pages.songListPage.approveSelectedSongByKeyboard();
    await expect(pages.songPreviewPage.nextButton).toBeVisible();
  });

  await test.step('Set Cooperation game mode and navigate to song', async () => {
    await pages.songPreviewPage.ensureGameModeToBeSet(gameMode);
    await pages.songPreviewPage.navigateToGoNextWithKeyboard();
    await pages.songPreviewPage.navigateToPlayTheSongWithKeyboard();
    await pages.calibration.approveDefaultCalibrationSetting();
  });

  await test.step('Players cooperation score is visible', async () => {
    await expect(pages.gamePage.playersCoopScoreElement).toBeVisible({ timeout: 15_000 });
    await expect(pages.gamePage.getPlayerScoreElement(blueMicNum)).not.toBeVisible();
    await expect(pages.gamePage.getPlayerScoreElement(redMicNum)).not.toBeVisible();
  });

  await test.step('Names of cooperating players are visible', async () => {
    await expect(pages.postGameResultsPage.getPlayerNameElement('coop')).toBeVisible({ timeout: 30_000 });
    await pages.postGameResultsPage.expectCoopPlayersNameToBe(player1Name, player2Name);
    await expect(pages.postGameResultsPage.getPlayerNameElement('p2')).not.toBeVisible();
  });

  await test.step('Skip to high scores - players names are visible', async () => {
    await expect(pages.postGameResultsPage.skipScoresButton).toBeVisible();
    await pages.postGameResultsPage.waitForPlayerScoreToBeGreaterThan(100);
    await pages.postGameResultsPage.skipScoresAnimation();
    await pages.postGameResultsPage.goToHighScoresStep();
    await expect(pages.postGameHighScoresPage.getCoopPlayersInput(player1Name, player2Name)).toBeVisible();
  });
});
