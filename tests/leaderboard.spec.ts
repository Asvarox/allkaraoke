import { expect, Page, test } from '@playwright/test';

import { enableLeaderboard, initTestMode, mockSongs } from './helpers';
import initialise from './page-objects/initialise';

let pages: ReturnType<typeof initialise>;

const song = 'e2e-multitrack-polish-1994';
const language = 'Polish';

// Local Durable Object storage survives between runs, and the board dedupes on the submitted name,
// so a leftover row from an earlier run would satisfy an assertion this run never earned.
// Kept short: the name field caps at MAX_NAME_LENGTH (20)
const runId = Math.random().toString(36).slice(2, 8);
const playerName = `E2E once ${runId}`;
const alwaysPlayerName = `E2E always ${runId}`;
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

/** A second run, entered from the song list the high-scores step returns to. */
const singTheSongAgain = async () => {
  await pages.songListPage.focusSong(song);
  await pages.songListPage.approveSelectedSongByKeyboard();
  await pages.songPreviewPage.navigateToGoNextWithKeyboard();
  await pages.songPreviewPage.navigateToPlayTheSongWithKeyboard();

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

    await test.step('Accepting hands over to the panel on the high scores step', async () => {
      await pages.leaderboardPage.fillIdentity(playerName, playerCountry);
      await pages.leaderboardPage.submit();

      await expect(pages.leaderboardPage.sharePanel).toBeVisible();
      await expect(pages.postGameHighScoresPage.selectSongButton).toContainText('Share score and sing a song');
    });

    await test.step('The score is sent on the way out, and lands on the board', async () => {
      await pages.postGameHighScoresPage.goToSongList();

      await page.goto('/?e2e-test');
      await pages.landingPage.enterTheGame();

      await expect(pages.leaderboardPage.rowFor(playerName).first()).toBeVisible({ timeout: 30_000 });
      await pages.leaderboardPage.expectRowFor(playerName, 'E2ETest', 'Easy');
    });
  });

  test('remembers the choice to always share and arms the next score', async ({ page }) => {
    test.slow();
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();

    await test.step('Opt into sharing every score from the prompt', async () => {
      await singTheSong(page);
      await expect(pages.leaderboardPage.prompt).toBeVisible();
      await pages.leaderboardPage.fillIdentity(alwaysPlayerName, playerCountry);
      await pages.leaderboardPage.submit();
    });

    await test.step('The next qualifying score is armed instead of prompted', async () => {
      await pages.postGameHighScoresPage.goToSongList();
      await singTheSongAgain();

      await expect(pages.leaderboardPage.prompt).toHaveCount(0);
      await expect(pages.leaderboardPage.sharePanel).toBeVisible();
      await expect(pages.leaderboardPage.panelNameInput).toHaveValue(alwaysPlayerName);
      await expect(pages.postGameHighScoresPage.selectSongButton).toContainText('Share score and sing a song');
    });

    await test.step('Moving on shares the score, and it lands on the board', async () => {
      await pages.postGameHighScoresPage.goToSongList();

      await page.goto('/?e2e-test');
      await pages.landingPage.enterTheGame();
      await expect(pages.leaderboardPage.rowFor(alwaysPlayerName).first()).toBeVisible({ timeout: 30_000 });
    });
  });

  test('stops asking after a decline, and keeps a way back in', async ({ page }) => {
    test.slow();
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await singTheSong(page);

    await expect(pages.leaderboardPage.prompt).toBeVisible();
    await pages.leaderboardPage.declineButton.click();
    await expect(pages.leaderboardPage.prompt).toHaveCount(0);

    await test.step('The high-scores step offers a way back into the prompt', async () => {
      await expect(pages.leaderboardPage.optInPanel).toBeVisible();
      await pages.leaderboardPage.openPromptButton.click();
      await expect(pages.leaderboardPage.prompt).toBeVisible();
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
