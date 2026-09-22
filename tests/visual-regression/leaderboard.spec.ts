import { expect, Page } from '@playwright/test';

import { initTestMode, mockRandom, mockSongs } from '../helpers';
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
 * The run that has just been sung carries a score and a timestamp that change every run - on the
 * local board, on the global one, and in the prompt. Only those cells are hidden: the rank and the
 * name beside them are the same every run, and blanking a whole row would leave a gap where the
 * board's own layout should be.
 */
const volatileRegions = (page: Page) => [
  page.getByTestId('highscore-current-row').getByTestId('scoreboard-row-score'),
  // Only present once the score has been submitted, i.e. for the sharing shot.
  page.getByTestId('song-leaderboard-own-row').getByTestId('scoreboard-row-score'),
  page.getByTestId('leaderboard-prompt-score'),
];

visual('Leaderboard prompt', async ({ page, context, browser, makeScreenshot }) => {
  const pages = initialise(page, context, browser);

  await initTestMode({ page, context });
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
  // The prompt reads "<score> points is good enough ..." inline, so a score one digit longer rewraps
  // the sentence and the dialog comes out a line taller. Hiding the score doesn't help - a hidden
  // element still takes up its own width - so pin the text to a fixed one before capturing.
  await page.getByTestId('leaderboard-prompt-score').evaluate((element) => (element.textContent = '1 000 000'));
  // Just the dialog - the score list behind it is volatile and isn't the subject of this shot
  await makeScreenshot('modal', { locator: pages.leaderboardPage.prompt, extraMasks: volatileRegions(page) });

  await pages.leaderboardPage.submit();

  await expect(pages.leaderboardPage.sharePanel).toBeVisible();
  await expect(pages.postGameHighScoresPage.selectSongButton).toContainText('Share score and sing a song');
  await makeScreenshot('sharing', { extraMasks: volatileRegions(page) });
});
