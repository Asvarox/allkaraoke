import { expect, Page, test } from '@playwright/test';

import { enableLeaderboard, initTestMode, mockSongs } from './helpers';
import initialise from './page-objects/initialise';

let pages: ReturnType<typeof initialise>;

const song = 'e2e-multitrack-polish-1994';
const language = 'Polish';

const playerName = 'E2E Board Player';
const playerCountry = 'Poland';

/**
 * From the main menu through a full song, stopping on the post-game high scores step.
 *
 * Sung on Easy on purpose: the stubbed microphone scores around 890k on the default difficulty,
 * just under the 1,000,000 the Worker requires, so the submission would be rejected server-side.
 */
const singTheSong = async (page: Page) => {
  await pages.mainMenuPage.goToInputSelectionPage();
  await pages.inputSelectionPage.selectAdvancedSetup();
  await pages.advancedConnectionPage.goToMainMenu();
  await pages.mainMenuPage.goToSingSong();

  await pages.songLanguagesPage.ensureSongLanguageIsSelected(language);
  await pages.songLanguagesPage.continueAndGoToSongList();

  await pages.songListPage.focusSong(song);
  await pages.songListPage.approveSelectedSongByKeyboard();

  await pages.songPreviewPage.navigateToDifficultySettingsWithKeyboard();
  await page.keyboard.press('Enter'); // Hard
  await page.keyboard.press('Enter'); // Easy
  await pages.songPreviewPage.expectGameDifficultyLevelToBe('Easy');
  await pages.songPreviewPage.navigateToGoNextWithKeyboard();

  await pages.songPreviewPage.navigateToPlayTheSongWithKeyboard();
  await pages.calibration.approveDefaultCalibrationSetting();

  await expect(pages.postGameResultsPage.skipScoreElement).toBeVisible({ timeout: 60_000 });
  await pages.postGameResultsPage.skipScoresAnimation();
  await pages.postGameResultsPage.goToHighScoresStep();
};

test.describe('Global leaderboard enabled', () => {
  test.beforeEach(async ({ page, context, browser }) => {
    pages = initialise(page, context, browser);
    await initTestMode({ page, context });
    await enableLeaderboard({ page, context });
    await mockSongs({ page, context });
  });

  test('a qualifying score can be submitted and shows up on the main menu board', async ({ page }) => {
    test.slow();
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();

    await test.step('The board is on the main menu before anything is submitted', async () => {
      await expect(pages.leaderboardPage.panel).toBeVisible();
    });

    await singTheSong(page);

    await test.step('The prompt opens on the high scores step', async () => {
      await expect(pages.leaderboardPage.prompt).toBeVisible();
    });

    await test.step('Name and country are submitted', async () => {
      await pages.leaderboardPage.fillIdentity(playerName, playerCountry);
      await pages.leaderboardPage.submit();
    });

    await test.step('The submitted score is on the main menu board', async () => {
      await page.goto('/?e2e-test');
      await pages.landingPage.enterTheGame();

      await expect(pages.leaderboardPage.rowFor(playerName).first()).toBeVisible({ timeout: 30_000 });
      await pages.leaderboardPage.expectRowFor(playerName, 'E2ETest', 'Easy');
    });
  });
});

test.describe('Global leaderboard disabled', () => {
  test.beforeEach(async ({ page, context, browser }) => {
    pages = initialise(page, context, browser);
    await initTestMode({ page, context });
    await mockSongs({ page, context });
  });

  test('renders neither the board nor the prompt when the flag is off', async ({ page }) => {
    test.slow();
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();

    await expect(pages.mainMenuPage.singSongButton).toBeVisible();
    await expect(page.getByTestId('leaderboard-panel')).toHaveCount(0);

    await singTheSong(page);

    await expect(pages.postGameHighScoresPage.highScoresContainer).toBeVisible();
    await expect(pages.leaderboardPage.prompt).toHaveCount(0);
  });
});
