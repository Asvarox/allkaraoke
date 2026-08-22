import { expect, Page } from '@playwright/test';

import { enableLeaderboard, initTestMode, mockRandom, mockSongs } from '../helpers';
import initialise from '../page-objects/initialise';
import { visual } from './visual';

const song = 'e2e-multitrack-polish-1994';

/**
 * The board identity is seeded rather than typed in, so the shots never depend on driving the
 * country dropdown at four viewport sizes — and the prompt and the panel render the same committed
 * values every run.
 */
const seedIdentity = (page: Page) =>
  page.addInitScript(() => {
    localStorage.setItem('settings-leaderboard-name', JSON.stringify('Visual Player'));
    localStorage.setItem('settings-leaderboard-country', JSON.stringify('pl'));
  });

/**
 * The row for the score just sung carries that score and today's date, and the prompt repeats the
 * score — both change between runs. The seeded rows around them are fixed, so only these are masked.
 */
const volatileRegions = (page: Page) => [
  page.getByTestId('highscore-current-row'),
  page.getByTestId('leaderboard-prompt-score'),
];

visual('Leaderboard prompt', async ({ page, context, browser, makeScreenshot }) => {
  const pages = initialise(page, context, browser);

  await initTestMode({ page, context });
  await enableLeaderboard({ page, context });
  await mockSongs({ page, context });
  // The game tip under the scores is picked at random on every mount, so the baseline would never
  // hold without pinning it
  await mockRandom({ page, context });
  await seedIdentity(page);

  // Straight to the menu rather than through the landing page, whose CTA leads somewhere else on
  // narrow viewports — same reason the other visual specs do it.
  await page.goto('/menu/?e2e-test');
  await pages.mainMenuPage.goToInputSelectionPage();
  await pages.inputSelectionPage.selectAdvancedSetup();
  await pages.advancedConnectionPage.goToMainMenu();
  await pages.mainMenuPage.goToSingSong();

  await pages.songLanguagesPage.ensureSongLanguageIsSelected('Polish');
  await pages.songLanguagesPage.continueAndGoToSongList();
  await pages.songListPage.focusSong(song);
  await pages.songListPage.approveSelectedSongByKeyboard();
  await pages.songPreviewPage.navigateToGoNextWithKeyboard();
  await pages.songPreviewPage.navigateToPlayTheSongWithKeyboard();
  await pages.calibration.approveDefaultCalibrationSetting();

  await expect(pages.postGameResultsPage.skipScoreElement).toBeVisible({ timeout: 60_000 });
  await pages.postGameResultsPage.skipScoresAnimation();
  await pages.postGameResultsPage.goToHighScoresStep();

  await expect(pages.leaderboardPage.prompt).toBeVisible();
  // Just the dialog: the score list behind it is volatile, and a mask over it would be painted on
  // top of the modal rather than behind it
  await makeScreenshot('modal', { locator: pages.leaderboardPage.prompt, extraMasks: volatileRegions(page) });

  await pages.leaderboardPage.submit();

  await expect(pages.leaderboardPage.sharePanel).toBeVisible();
  await expect(pages.postGameHighScoresPage.selectSongButton).toContainText('Share score and sing a song');
  await makeScreenshot('sharing', { extraMasks: volatileRegions(page) });
});
