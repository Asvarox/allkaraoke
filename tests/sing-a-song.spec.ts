import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const song1 = 'e2e-single-english-1995';
const song2 = 'e2e-multitrack-polish-1994';
const playlistName = 'Polish';
const modeName = 'Pass The Mic';
const levelName = 'Hard';
const player1 = 0;
const player2 = 1;
const player1Name = 'E2E Player 1';
const player2Name = 'E2E Player 2';
const track1 = 1;
const track2 = 2;
const updatedName = 'Updated name';

test('Sing a song', async ({ page, browserName }, testInfo) => {
  test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectAdvancedSetup();
  await pages.advancedConnectionPage.goToMainMenu();
  await pages.mainMenuPage.goToSingSong();
  await pages.songLanguagesPage.continueAndGoToSongList();
  await expect(pages.songListPage.getSongElement(song1)).toBeVisible();
  await pages.songListPage.approveSelectedSongByKeyboard();
  await expect(pages.songPreviewPage.nextButton).toBeVisible();
  await page.keyboard.press(browserName === 'firefox' ? 'Backspace' : 'Escape'); // check if escape works for Chrome
  await expect(pages.songPreviewPage.nextButton).not.toBeVisible();

  await pages.songListPage.navigateToSongWithKeyboard(song2);
  await expect(pages.songListPage.getDuetSongIcon(song2)).toBeVisible();
  await expect(pages.songListPage.getDuetSongIcon(song1)).not.toBeVisible();

  await pages.songListPage.goToPlaylist(playlistName);
  await pages.songListPage.approveSelectedSongByKeyboard();

  await pages.songPreviewPage.navigateToGameModeSettingsWithKeyboard();
  await page.keyboard.press('Enter'); // change to duel
  await page.keyboard.press('Enter'); // change to pass the mic
  await pages.songPreviewPage.expectGameModeToBe(modeName);

  await pages.songPreviewPage.navigateToDifficultySettingsWithKeyboard();
  await page.keyboard.press('Enter'); // change to hard
  await pages.songPreviewPage.expectGameDifficultyLevelToBe(levelName);

  await pages.songPreviewPage.navigateToGoNextWithKeyboard();

  // Player 1
  await expect(pages.songPreviewPage.getPlayerNameInput(player1)).toBeVisible();
  await pages.songPreviewPage.navigateAndEnterPlayerNameWithKeyboard(player1, player1Name);
  await pages.songPreviewPage.expectEnteredPlayerNameToBe(player1, player1Name);

  await pages.songPreviewPage.navigateAndTogglePlayerTrackSettingsWithKeyboard(player1);
  await pages.songPreviewPage.expectPlayerTrackNumberToBe(player1, track2);

  // Player 2
  await expect(pages.songPreviewPage.getPlayerNameInput(player2)).toBeVisible();
  await pages.songPreviewPage.navigateAndEnterPlayerNameWithKeyboard(player2, player2Name);
  await pages.songPreviewPage.expectEnteredPlayerNameToBe(player2, player2Name);

  await pages.songPreviewPage.navigateAndTogglePlayerTrackSettingsWithKeyboard(player2);
  await pages.songPreviewPage.expectPlayerTrackNumberToBe(player2, track1);

  await pages.songPreviewPage.navigateToPlayTheSongWithKeyboard();

  const p1CL = '[data-test="lyrics-current-player-0"]';
  const p1NL = '[data-test="lyrics-next-player-0"]';
  const p2CL = '[data-test="lyrics-current-player-1"]';
  const p2NL = '[data-test="lyrics-next-player-1"]';

  test.setTimeout(testInfo.timeout + 3000);

  await Promise.all(['Track 2', 'Section', '1'].map((text) => expect(page.locator(p1CL)).toContainText(text)));
  await Promise.all(['Track 2', 'Section', '2'].map((text) => expect(page.locator(p1NL)).toContainText(text)));
  await Promise.all(['Track 1', 'Section 1'].map((text) => expect(page.locator(p2CL)).toContainText(text)));
  await Promise.all(['Track 1', 'Section 2'].map((text) => expect(page.locator(p2NL)).toContainText(text)));

  await Promise.all(['Track 2', 'Section', '2'].map((text) => expect(page.locator(p1CL)).toContainText(text)));
  await Promise.all(['Track 1', 'Section 2'].map((text) => expect(page.locator(p2CL)).toContainText(text)));
  await Promise.all(['Track 2', 'Section 3'].map((text) => expect(page.locator(p1NL)).toContainText(text)));

  test.setTimeout(testInfo.timeout);

  await expect(pages.postGameResultsPage.skipScoreElement).toBeVisible({ timeout: 30_000 });
  await pages.postGameResultsPage.expectPlayerNameToBeDisplayed(player1, player1Name);
  await pages.postGameResultsPage.expectPlayerNameToBeDisplayed(player2, player2Name);
  await pages.postGameResultsPage.skipScoresAnimation();
  await pages.postGameResultsPage.goToHighScoresStep();
  await expect(pages.postGameHighScoresPage.getPlayerNameInput(player1Name)).toBeVisible();
  await expect(pages.postGameHighScoresPage.getPlayerNameInput(player2Name)).toBeVisible();

  await pages.postGameHighScoresPage.navigateAndUpdateHighestScorePlayerNameByKeyboard(updatedName);
  await pages.postGameHighScoresPage.goToSongList();
  await pages.songListPage.expectSongToBeMarkedAsPlayedToday(song2);
  await pages.songListPage.expectPlaylistToBeSelected(playlistName);
  await expect(pages.songListPage.getSongElement(song1)).not.toBeVisible();
  await pages.songListPage.approveSelectedSongByKeyboard();
  await pages.songPreviewPage.navigateToGoNextWithKeyboard();
  await pages.songPreviewPage.expectEnteredPlayerNameToBePrefilledWith(player1, player1Name);
  await pages.songPreviewPage.expectEnteredPlayerNameToBePrefilledWith(player2, player2Name);

  await pages.songPreviewPage.expectRecentPlayerListToContainName(updatedName);
  await pages.songPreviewPage.playTheSong();
  await expect(page.locator(p1CL)).toBeVisible();
  await page.waitForTimeout(1000); // otherwise the click might happen before the game actually starts
  await pages.gamePage.goToPauseMenu(); // another pause-menu opening method
  await pages.gamePage.resumeSongButton.click();
  await expect(pages.gamePage.resumeSongButton).not.toBeVisible();
  await pages.gamePage.exitSong();
  await pages.postGameResultsPage.skipScoresAnimation();
  await pages.postGameResultsPage.goToHighScoresStep();
  await expect(pages.postGameHighScoresPage.highScoresContainer).toContainText(updatedName);
});
