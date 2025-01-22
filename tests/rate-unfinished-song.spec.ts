import { expect, test } from '@playwright/test';
import initialise from './PageObjects/initialise';
import { initTestMode, mockSongs } from './helpers';
import { openAndConnectRemoteMicDirectly } from './steps/openAndConnectRemoteMic';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test('window for rating unfinished song is visible and can be skipped by the user', async ({ page }) => {
  await test.step('Select Advanced setup', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectAdvancedSetup();
  });

  await test.step('Ensure all song languages are selected', async () => {
    await pages.advancedConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToSelectSongLanguage();
    await pages.songLanguagesPage.ensureAllLanguagesAreSelected();
  });

  await test.step('Play the random song', async () => {
    await pages.songLanguagesPage.goBackToMainMenu();
    await pages.mainMenuPage.goToSingSong();
    await page.waitForTimeout(500);
    await pages.songListPage.approveSelectedSongByKeyboard();
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.playTheSong();
  });

  await test.step('After exiting an unfinished song, the user sees a window where they can provide a reason for stopping', async () => {
    await page.waitForTimeout(1000);
    await pages.gamePage.exitSong();
    await expect(pages.rateUnfinishedSongPage.rateSongContainer).toBeVisible();
    await expect(pages.rateUnfinishedSongPage.lyricsSyncIssueButton).toBeVisible();
    await expect(pages.rateUnfinishedSongPage.wrongLyricsIssueButton).toBeVisible();
    await expect(pages.rateUnfinishedSongPage.tooLoudIssueButton).toBeVisible();
  });

  await test.step('User can skip the song rating container and go to pick up another song', async () => {
    await pages.rateUnfinishedSongPage.skipSongRating();
    await pages.postGameResultsPage.skipScoresAnimation();
    await pages.postGameResultsPage.goToHighScoresStep();
    await pages.postGameHighScoresPage.goToSongList();
  });
});

test('user can correctly select all of the shown reasons why the song was not completed', async ({ page, browser }) => {
  const songID = 'e2e-pass-test-spanish-1994';

  test.slow();
  await test.step('Select Smartphones setup', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectSmartphones();
  });

  const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player1');

  await test.step('Ensure all languages are selected', async () => {
    await pages.smartphonesConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureAllLanguagesAreSelected();
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Navigate with keyboard to play random song', async () => {
    await remoteMic.remoteMicMainPage.pressEnterOnRemoteMic();
    await pages.songPreviewPage.navigateToGoNextWithKeyboard(remoteMic._page);
    await pages.songPreviewPage.navigateToPlayTheSongWithKeyboard(remoteMic._page);
    await pages.calibration.approveDefaultCalibrationSetting();
    await remoteMic.remoteMicMainPage.pressReadyOnRemoteMic();
  });

  await test.step('After exiting a song before its end, a container with the song`s rating appears', async () => {
    await expect(pages.gamePage.getSongLyricsForPlayerElement(0)).toBeVisible();
    await page.waitForTimeout(500);
    await pages.gamePage.exitSong();
    await expect(pages.rateUnfinishedSongPage.rateSongContainer).toBeVisible();
  });

  await test.step('User can select `lyrics synchronization issue` as a reason of unfinished song', async () => {
    await pages.rateUnfinishedSongPage.selectLyricsSyncIssue();
    await pages.rateUnfinishedSongPage.submitYourSelectionAndExit();
  });

  await test.step('Go back to Song List', async () => {
    await pages.postGameResultsPage.skipScoresAnimation();
    await pages.postGameResultsPage.goToHighScoresStep();
    await pages.postGameHighScoresPage.goToSongList();
  });

  await test.step('Navigate with keyboard to play random song', async () => {
    await remoteMic.remoteMicMainPage.pressEnterOnRemoteMic();
    await pages.songPreviewPage.navigateToGoNextWithKeyboard(remoteMic._page);
    await pages.songPreviewPage.navigateToPlayTheSongWithKeyboard(remoteMic._page);
    await remoteMic.remoteMicMainPage.pressReadyOnRemoteMic();
  });

  await test.step('Exit the song before its end', async () => {
    await expect(pages.gamePage.getSongLyricsForPlayerElement(0)).toBeVisible();
    await page.waitForTimeout(500);
    await pages.gamePage.exitSong();
  });

  await test.step('User can select `wrong lyrics issue` as a reason of unfinished song', async () => {
    await pages.rateUnfinishedSongPage.selectWrongLyricsIssue();
    await pages.rateUnfinishedSongPage.submitYourSelectionAndExit();
  });

  await test.step('Go back to Song List', async () => {
    await pages.postGameResultsPage.skipScoresAnimation();
    await pages.postGameResultsPage.goToHighScoresStep();
    await pages.postGameHighScoresPage.goToSongList();
  });

  await test.step('Navigate with keyboard to play random song', async () => {
    await remoteMic.remoteMicMainPage.pressEnterOnRemoteMic();
    await pages.songPreviewPage.navigateToGoNextWithKeyboard(remoteMic._page);
    await pages.songPreviewPage.navigateToPlayTheSongWithKeyboard(remoteMic._page);
    await remoteMic.remoteMicMainPage.pressReadyOnRemoteMic();
  });

  await test.step('Exit the song before its end', async () => {
    await expect(pages.gamePage.getSongLyricsForPlayerElement(0)).toBeVisible();
    await page.waitForTimeout(500);
    await pages.gamePage.exitSong();
  });

  await test.step('User can select `volume issue` as a reason of unfinished song', async () => {
    await pages.rateUnfinishedSongPage.selectTooLoudIssue();
    await pages.rateUnfinishedSongPage.submitYourSelectionAndExit();
  });

  await test.step('Go back to Song List', async () => {
    await pages.postGameResultsPage.skipScoresAnimation();
    await pages.postGameResultsPage.goToHighScoresStep();
    await pages.postGameHighScoresPage.goToSongList();
  });

  await test.step('Navigate with keyboard to play random song', async () => {
    await remoteMic.remoteMicMainPage.pressEnterOnRemoteMic();
    await pages.songPreviewPage.navigateToGoNextWithKeyboard(remoteMic._page);
    await pages.songPreviewPage.navigateToPlayTheSongWithKeyboard(remoteMic._page);
    await remoteMic.remoteMicMainPage.pressReadyOnRemoteMic();
  });

  await test.step('Exit the song before its end', async () => {
    await expect(pages.gamePage.getSongLyricsForPlayerElement(0)).toBeVisible();
    await page.waitForTimeout(500);
    await pages.gamePage.exitSong();
  });

  await test.step('User can select all issues as a reasons of unfinished song', async () => {
    await pages.rateUnfinishedSongPage.selectLyricsSyncIssue();
    await pages.rateUnfinishedSongPage.selectWrongLyricsIssue();
    await pages.rateUnfinishedSongPage.selectTooLoudIssue();
    await pages.rateUnfinishedSongPage.submitYourSelectionAndExit();
  });

  await test.step('User can return to Song List to choose another song', async () => {
    await pages.postGameResultsPage.skipScoresAnimation();
    await pages.postGameResultsPage.goToHighScoresStep();
    await pages.postGameHighScoresPage.goToSongList();
    await pages.songListPage.getSongElement(songID);
    await pages.songListPage.openPreviewForSong(songID);
    await pages.songListPage.expectSelectedSongToBe(songID);
  });
});
