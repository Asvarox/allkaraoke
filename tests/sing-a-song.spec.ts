import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const song1 = {
  ID: 'e2e-single-english-1995',
  language: 'English',
} as const;

const song2 = {
  ID: 'e2e-multitrack-polish-1994',
  language: 'Polish',
  playlistName: 'Polish',
} as const;

const player1 = {
  number: 0,
  name: 'E2E Player 1',
};

const player2 = {
  number: 1,
  name: 'E2E Player 2',
};
const updatedName = 'Updated name';

test('Sing a song', async ({ page, browserName }, testInfo) => {
  test.slow();
  await page.goto('/?e2e-test');

  await test.step('Select Advanced setup', async () => {
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectAdvancedSetup();
    await pages.advancedConnectionPage.goToMainMenu();
  });

  await test.step('Ensure song languages are selected', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureLanguageToBeSelected(song1.language);
    await pages.songLanguagesPage.ensureLanguageToBeSelected(song2.language);
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Check preview of song1 and go back to Song List', async () => {
    await expect(await pages.songListPage.getSongElement(song1.ID)).toBeVisible();
    await pages.songListPage.approveSelectedSongByKeyboard();
    await expect(pages.songPreviewPage.nextButton).toBeVisible();
    await page.keyboard.press(browserName === 'firefox' ? 'Backspace' : 'Escape'); // check if escape works for Chrome
    await expect(pages.songPreviewPage.nextButton).not.toBeVisible();
  });

  await test.step('Check visibility of duet icon in duet song', async () => {
    await pages.songListPage.ensureSongToBeSelected(song2.ID);
    await expect(await pages.songListPage.getDuetSongIcon(song2.ID)).toBeVisible();
    await expect(await pages.songListPage.getDuetSongIcon(song1.ID)).not.toBeVisible();
  });

  await test.step('Go to playlist and open preview of the song', async () => {
    await pages.songListPage.goToPlaylist(song2.playlistName);
    await pages.songListPage.approveSelectedSongByKeyboard();
  });

  await test.step('Set game mode', async () => {
    await pages.songPreviewPage.navigateToGameModeSettingsWithKeyboard();
    await pages.songPreviewPage.ensureGameModeToBeSetWithKeyboard('Pass The Mic');
  });

  await test.step('Set difficulty level', async () => {
    await pages.songPreviewPage.navigateAndSetDifficultySettingsWithKeyboard('Easy');
    await pages.songPreviewPage.navigateToGoNextWithKeyboard();
  });

  await test.step('After entering players names and setting tracks, play the song', async () => {
    // Player 1
    await expect(pages.songPreviewPage.getPlayerNameInput('p1')).toBeVisible();
    await pages.songPreviewPage.navigateAndEnterPlayerNameWithKeyboard('p1', player1.name);
    await pages.songPreviewPage.expectEnteredPlayerNameToBe('p1', player1.name);
    await pages.songPreviewPage.navigateAndTogglePlayerTrackSettingsWithKeyboard('p1');
    await pages.songPreviewPage.expectPlayerTrackNumberToBe('p1', 'Track 2');

    // Player 2
    await expect(pages.songPreviewPage.getPlayerNameInput('p2')).toBeVisible();
    await pages.songPreviewPage.navigateAndEnterPlayerNameWithKeyboard('p2', player2.name);
    await pages.songPreviewPage.expectEnteredPlayerNameToBe('p2', player2.name);
    await pages.songPreviewPage.navigateAndTogglePlayerTrackSettingsWithKeyboard('p2');
    await pages.songPreviewPage.expectPlayerTrackNumberToBe('p2', 'Track 1');
    await pages.songPreviewPage.navigateToPlayTheSongWithKeyboard();
    await pages.calibration.approveDefaultCalibrationSetting();
  });

  const p1CL = '[data-test="lyrics-current-player-0"]';
  const p1NL = '[data-test="lyrics-next-player-0"]';
  const p2CL = '[data-test="lyrics-current-player-1"]';
  const p2NL = '[data-test="lyrics-next-player-1"]';

  test.setTimeout(testInfo.timeout + 3000);

  // test.step - Lyrics should be visible for players
  await Promise.all(['Track 2', 'Section', '1'].map((text) => expect(page.locator(p1CL)).toContainText(text)));
  await Promise.all(['Track 2', 'Section', '2'].map((text) => expect(page.locator(p1NL)).toContainText(text)));
  await Promise.all(['Track 1', 'Section 1'].map((text) => expect(page.locator(p2CL)).toContainText(text)));
  await Promise.all(['Track 1', 'Section 2'].map((text) => expect(page.locator(p2NL)).toContainText(text)));

  await Promise.all(['Track 2', 'Section', '2'].map((text) => expect(page.locator(p1CL)).toContainText(text)));
  await Promise.all(['Track 1', 'Section 2'].map((text) => expect(page.locator(p2CL)).toContainText(text)));
  await Promise.all(['Track 2', 'Section 3'].map((text) => expect(page.locator(p1NL)).toContainText(text)));

  test.setTimeout(testInfo.timeout);

  await test.step('Players scores should displayed', async () => {
    await expect(pages.gamePage.getPlayerScoreElement(player1.number)).toBeVisible();
    await expect(pages.gamePage.getPlayerScoreElement(player2.number)).toBeVisible();
  });

  await test.step('After the game, players names and scores should be displayed in Results', async () => {
    await expect(pages.postGameResultsPage.skipScoresButton).toBeVisible({ timeout: 30_000 });
    await pages.postGameResultsPage.expectPlayerNameToBe('p1', player1.name);
    await pages.postGameResultsPage.expectPlayerNameToBe('p2', player2.name);
    await expect(pages.postGameResultsPage.getPlayerScoreElement('p1')).toBeVisible();
    await expect(pages.postGameResultsPage.getPlayerScoreElement('p2')).toBeVisible();
  });

  await test.step('Skip to High Scores - check names visibility and update one of them', async () => {
    await pages.postGameResultsPage.skipScoresAnimation();
    await pages.postGameResultsPage.goToHighScoresStep();
    await expect(pages.postGameHighScoresPage.getPlayerInput(player1.name)).toBeVisible();
    await expect(pages.postGameHighScoresPage.getPlayerInput(player2.name)).toBeVisible();
    await pages.postGameHighScoresPage.navigateAndUpdateHighestScorePlayerNameByKeyboard(updatedName);
  });

  await test.step('After singing, the song should be marked as played today', async () => {
    await pages.postGameHighScoresPage.goToSongList();
    await pages.songListPage.expectSongToBeMarkedAsPlayedToday(song2.ID);
  });

  await test.step('Choose another song from the playlist', async () => {
    await pages.songListPage.expectPlaylistToBeSelected(song2.playlistName);
    await expect(await pages.songListPage.getSongElement(song1.ID)).not.toBeVisible();
    await pages.songListPage.approveSelectedSongByKeyboard();
    await pages.songPreviewPage.navigateToGoNextWithKeyboard();
  });

  await test.step('Players names should be already prefilled and updated name visible on recent player list', async () => {
    await pages.songPreviewPage.expectEnteredPlayerNameToBePrefilledWith('p1', player1.name);
    await pages.songPreviewPage.expectEnteredPlayerNameToBePrefilledWith('p2', player2.name);
    await pages.songPreviewPage.expectRecentPlayerListToContainName(updatedName);
  });

  await test.step('Play the song and go to pause menu', async () => {
    await pages.songPreviewPage.playTheSong(true, false);
    await expect(page.locator(p1CL)).toBeVisible();
    await page.waitForTimeout(1000); // otherwise the click might happen before the game actually starts
    await pages.gamePage.openPauseMenuByClick();
  });

  // test.step - Get current players scores
  const currentP1score: null | string = await pages.gamePage.getCurrentPlayerScore(player1.number);
  const currentP2score: null | string = await pages.gamePage.getCurrentPlayerScore(player2.number);

  await test.step('When the song resumes, the players score values should be the same as before', async () => {
    await pages.pauseMenuPage.resumeSong();
    await pages.gamePage.expectPlayerScoreValueToBe(player1.number, currentP1score!);
    await pages.gamePage.expectPlayerScoreValueToBe(player2.number, currentP2score!);
  });

  await test.step('After game is ended, properly players score values should be displayed', async () => {
    await pages.gamePage.openPauseMenuAndExitSong();
    await pages.rateUnfinishedSongPage.skipSongRating();
    await pages.postGameResultsPage.expectPlayerScoreToBe('p1', currentP1score!);
    await pages.postGameResultsPage.expectPlayerScoreToBe('p2', currentP2score!);
  });

  await test.step('Check if the already updated name is still save in High Scores', async () => {
    await pages.postGameResultsPage.skipScoresAnimation();
    await pages.postGameResultsPage.goToHighScoresStep();
    await expect(pages.postGameHighScoresPage.highScoresContainer).toContainText(updatedName);
  });
});
