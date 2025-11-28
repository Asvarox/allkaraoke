import { expect, test } from '@playwright/test';
import { RemoteMicPages } from './PageObjects/RemoteMic/initialiseRemoteMic';
import initialise from './PageObjects/initialise';
import { initTestMode, mockSongs } from './helpers';
import { openAndConnectRemoteMicWithCode } from './steps/openAndConnectRemoteMic';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const songsID = {
  french: 'e2e-croissant-french-1994',
  spanish: 'e2e-pass-test-spanish-1994',
} as const;

test('window for rating unfinished song is visible and can be skipped by the user', async ({ page, browserName }) => {
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
    await pages.songLanguagesPage.ensureAllLanguagesToBe('selected');
  });

  await test.step('Play the song', async () => {
    await pages.songLanguagesPage.goBackToMainMenu();
    await pages.mainMenuPage.goToSingSong();
    if (browserName === 'firefox') {
      await pages.songListPage.toolbar.ensureFullscreenIsOff();
    }
    await expect(pages.songListPage.songPreviewElement).toBeVisible();
    await pages.songListPage.openSongPreview(songsID.french);
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

  await test.step('After pressing Escape the user returns to game mode', async () => {
    await page.keyboard.press('Escape');
    await expect(pages.gamePage.getSongLyricsForPlayerElement(0)).toBeVisible();
    await expect(pages.rateUnfinishedSongPage.rateSongContainer).not.toBeVisible();
  });

  await test.step('User can skip the song rating container and go to pick up another song', async () => {
    await pages.gamePage.exitSong();
    await pages.rateUnfinishedSongPage.skipSongRating();
    await pages.postGameResultsPage.skipScoresAnimation();
    await pages.postGameResultsPage.goToHighScoresStep();
    await pages.postGameHighScoresPage.goToSongList();
  });
});

test('user can correctly select all of the shown reasons why the song was not completed', async ({
  page,
  browser,
  browserName,
}) => {
  let remoteMic: RemoteMicPages;

  const goBackToSongList = async () => {
    await test.step('Go back to Song List', async () => {
      await pages.postGameResultsPage.skipScoresAnimation();
      await pages.postGameResultsPage.goToHighScoresStep();
      await pages.postGameHighScoresPage.goToSongList();
    });
  };

  const navigateAndPlayNextSong = async () => {
    await goBackToSongList();
    await test.step('Play the song', async () => {
      await pages.songListPage.openSongPreview(songsID.french);
      await pages.songPreviewPage.goNext();
      await pages.songPreviewPage.playTheSong(true, false);
    });

    await test.step('Exit the song before its end', async () => {
      await expect(pages.gamePage.getSongLyricsForPlayerElement(0)).toBeVisible();
      await page.waitForTimeout(500);
      await pages.gamePage.exitSong();
    });
  };

  test.slow();
  await test.step('Select Computer`s mic setup', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectComputersMicrophone();
  });

  await test.step('Ensure all languages are selected', async () => {
    await pages.computersMicConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureAllLanguagesToBe('selected');
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Play the song', async () => {
    if (browserName === 'firefox') {
      await pages.songListPage.toolbar.ensureFullscreenIsOff();
    }
    await pages.songListPage.openSongPreview(songsID.french);
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.playTheSong();
  });

  await test.step('After exiting a song before its end, a container with the song`s rating appears', async () => {
    await expect(pages.gamePage.getSongLyricsForPlayerElement(0)).toBeVisible();
    await page.waitForTimeout(500);
    await pages.gamePage.exitSong();
    await expect(pages.rateUnfinishedSongPage.rateSongContainer).toBeVisible();
  });

  await test.step('User can select `lyrics synchronization issue` as a reason of unfinished song', async () => {
    await pages.rateUnfinishedSongPage.expectIssueToBeUnselected('wrong lyrics');
    await pages.rateUnfinishedSongPage.expectIssueToBeUnselected('too quiet');
    await pages.rateUnfinishedSongPage.expectIssueToBeUnselected('too loud');

    await pages.rateUnfinishedSongPage.ensureIssueToBeSelected('lyrics not sync');
    await pages.rateUnfinishedSongPage.submitYourSelectionAndExit();
    await expect(pages.rateUnfinishedSongPage.rateSongContainer).not.toBeVisible();
  });

  await navigateAndPlayNextSong();

  await test.step('User can select `wrong lyrics issue` as a reason of unfinished song', async () => {
    await pages.rateUnfinishedSongPage.expectIssueToBeUnselected('lyrics not sync');
    await pages.rateUnfinishedSongPage.expectIssueToBeUnselected('too quiet');
    await pages.rateUnfinishedSongPage.expectIssueToBeUnselected('too loud');

    await pages.rateUnfinishedSongPage.ensureIssueToBeSelected('wrong lyrics');
    await pages.rateUnfinishedSongPage.submitYourSelectionAndExit();
  });

  await navigateAndPlayNextSong();

  await test.step('User can select `too quiet` song issue as a reason of unfinished song', async () => {
    await pages.rateUnfinishedSongPage.expectIssueToBeUnselected('lyrics not sync');
    await pages.rateUnfinishedSongPage.expectIssueToBeUnselected('wrong lyrics');
    await pages.rateUnfinishedSongPage.expectIssueToBeUnselected('too loud');

    await pages.rateUnfinishedSongPage.ensureIssueToBeSelected('too quiet');
    await pages.rateUnfinishedSongPage.submitYourSelectionAndExit();
  });

  await navigateAndPlayNextSong();

  await test.step('User can select `too loud` song issue as a reason of unfinished song', async () => {
    await pages.rateUnfinishedSongPage.expectIssueToBeUnselected('lyrics not sync');
    await pages.rateUnfinishedSongPage.expectIssueToBeUnselected('wrong lyrics');
    await pages.rateUnfinishedSongPage.expectIssueToBeUnselected('too quiet');

    await pages.rateUnfinishedSongPage.selectIssueWithKeyboard('too loud');
    await pages.rateUnfinishedSongPage.expectIssueToBeSelected('too loud');
    await pages.rateUnfinishedSongPage.submitIssueWithKeyboard();
    await expect(pages.rateUnfinishedSongPage.rateSongContainer).not.toBeVisible();
  });

  await goBackToSongList();

  await test.step('Choose the song and change input to Smartphones mic', async () => {
    await pages.songListPage.openSongPreview(songsID.french);
    await pages.songPreviewPage.goNext();

    await pages.songPreviewPage.goToInputSelectionPage();
    await pages.computersMicConnectionPage.goBackToInputSelection();
    await pages.inputSelectionPage.selectSmartphones();
    remoteMic = await openAndConnectRemoteMicWithCode(page, browser, 'Player 1');

    await pages.smartphonesConnectionPage.goToSongPreview();
    await pages.songPreviewPage.navigateToPlayTheSongWithKeyboard();
    await remoteMic.remoteMicMainPage.pressReadyOnRemoteMic();
  });

  await test.step('Exit the song before its end', async () => {
    await expect(pages.gamePage.getSongLyricsForPlayerElement(0)).toBeVisible();
    await page.waitForTimeout(500);
    await remoteMic.remoteMicMainPage.goToPauseMenuWithKeyboard();
    await pages.gamePage.navigateAndApproveWithKeyboard('button-exit-song', remoteMic._page);
  });

  await test.step('Only 1 volume issue (too quiet/too loud) can be selected at the same time - after clicking also on 2nd option, 1st is unselected', async () => {
    await pages.rateUnfinishedSongPage.selectIssueWithKeyboard('too quiet', remoteMic._page);
    await pages.rateUnfinishedSongPage.expectIssueToBeSelected('too quiet');

    await pages.rateUnfinishedSongPage.selectIssueWithKeyboard('too loud', remoteMic._page);
    await pages.rateUnfinishedSongPage.expectIssueToBeSelected('too loud');
    await pages.rateUnfinishedSongPage.expectIssueToBeUnselected('too quiet');
  });

  await test.step('Select 2 more issues - user can select all 3 category issues as a reasons of unfinished song', async () => {
    await pages.rateUnfinishedSongPage.selectIssueWithKeyboard('lyrics not sync', remoteMic._page);
    await pages.rateUnfinishedSongPage.selectIssueWithKeyboard('wrong lyrics', remoteMic._page);
    await pages.rateUnfinishedSongPage.expectIssueToBeSelected('lyrics not sync');
    await pages.rateUnfinishedSongPage.expectIssueToBeSelected('wrong lyrics');
    await pages.rateUnfinishedSongPage.expectIssueToBeSelected('too loud');
    await pages.rateUnfinishedSongPage.submitIssueWithKeyboard(remoteMic._page);
    await expect(pages.rateUnfinishedSongPage.rateSongContainer).not.toBeVisible();
  });

  await test.step('User can return to Song List to choose another song', async () => {
    await pages.postGameResultsPage.skipScoresAnimation();
    await pages.postGameResultsPage.goToHighScoresStep();
    await pages.postGameHighScoresPage.goToSongList();
    await expect(await pages.songListPage.getSongElement(songsID.spanish)).toBeVisible();
    await pages.songListPage.ensureSongToBeSelected(songsID.spanish);
    await pages.songListPage.expectSelectedSongToBe(songsID.spanish);
  });
});

test('If a song has volume = 1, the `too quiet` issue cannot be selected', async ({ page }) => {
  await test.step('Ensure song language is selected ', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureLanguageToBeSelected('Spanish');
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Select computer`s mic and play the song', async () => {
    await expect(await pages.songListPage.getSongElement(songsID.spanish)).toBeVisible();
    await pages.songListPage.openSongPreview(songsID.spanish);
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectComputersMicrophone();
    await pages.computersMicConnectionPage.continueToTheSong();
    await pages.songPreviewPage.playTheSong();
  });

  await test.step('Exit the song - the `too quiet` issue should not be displayed for selection, when song has max vol = 1', async () => {
    await page.waitForTimeout(1000);
    await pages.gamePage.exitSong();
    await expect(pages.rateUnfinishedSongPage.rateSongContainer).toBeVisible();
    await expect(pages.rateUnfinishedSongPage.tooQuietIssueButton).not.toBeVisible();
    await expect(pages.rateUnfinishedSongPage.asLoudAsItCouldBeInfo).toBeVisible();
    await expect(pages.rateUnfinishedSongPage.asLoudAsItCouldBeInfo).toBeDisabled();
  });
});
