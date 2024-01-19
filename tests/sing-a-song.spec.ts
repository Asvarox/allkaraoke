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
  await pages.advancedConnectionPage.saveAndGoToSing();
  await pages.mainMenuPage.goToSingSong();
  await pages.songLanguagesPage.continueAndGoToSongList();
  await expect(pages.songListPage.getSongElement(song1)).toBeVisible();
  await pages.songListPage.approveSelectedSongByKeyboard();
  await expect(pages.songPreviewPage.nextButton).toBeVisible();
  await page.keyboard.press(browserName === 'firefox' ? 'Backspace' : 'Escape'); // check if escape works for Chrome
  await expect(pages.songPreviewPage.nextButton).not.toBeVisible();

  await pages.songListPage.navigateToSongWithKeyboard(song2);
  await expect(pages.songListPage.duetSongIcon(song2)).toBeVisible();
  await expect(pages.songListPage.duetSongIcon(song1)).not.toBeVisible();

  await pages.songListPage.goToPlaylist(playlistName);
  await pages.songListPage.approveSelectedSongByKeyboard();

  await pages.songPreviewPage.navigateToGameModeSettingsByKeyboard();
  await page.keyboard.press('Enter'); // change to duel
  await page.keyboard.press('Enter'); // change to pass the mic
  await pages.songPreviewPage.expectGameModeToBe(modeName);

  await pages.songPreviewPage.navigateToDifficultySettingsByKeyboard();
  await page.keyboard.press('Enter'); // change to hard
  await pages.songPreviewPage.expectGameDifficultyLevelToBe(levelName);

  await pages.songPreviewPage.navigateToGoNextByKeyboard();

  // Player 1
  await expect(pages.songPreviewPage.playerNameInput(player1)).toBeVisible();
  await pages.songPreviewPage.navigateAndEnterPlayerNameByKeyboard(player1, player1Name);
  await pages.songPreviewPage.expectEnteredPlayerNameToBeVisible(player1, player1Name);

  await pages.songPreviewPage.navigateAndTogglePlayerTrackSettingsByKeyboard(player1);
  await pages.songPreviewPage.expectPlayerTrackNumberToBe(player1, track2);

  // Player 2
  await expect(pages.songPreviewPage.playerNameInput(player2)).toBeVisible();
  await pages.songPreviewPage.navigateAndEnterPlayerNameByKeyboard(player2, player2Name);
  await pages.songPreviewPage.expectEnteredPlayerNameToBeVisible(player2, player2Name);

  await pages.songPreviewPage.navigateAndTogglePlayerTrackSettingsByKeyboard(player2);
  await pages.songPreviewPage.expectPlayerTrackNumberToBe(player2, track1);

  await pages.songPreviewPage.navigateToPlayTheSongByKeyboard();

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

  await expect(pages.postGame.skipScoreElement).toBeVisible({ timeout: 30_000 });
  await pages.postGame.expectPlayerNameToBeDisplayed(player1, player1Name);
  await pages.postGame.expectPlayerNameToBeDisplayed(player2, player2Name);
  await pages.postGame.skipScoresAnimation();
  await pages.postGame.goNext();
  await pages.postGame.expectPlayerNameToBeVisibleOnHighscoreList(player1Name);
  await pages.postGame.expectPlayerNameToBeVisibleOnHighscoreList(player2Name);

  await pages.postGame.navigateAndUpdateHighestScorePlayerNameByKeyboard(updatedName);
  await pages.postGame.goToSelectNewSong();
  await pages.songListPage.expectSongPlayedTodayIndicatorToBe(song2);
  await pages.songListPage.expectPlaylistToBeVisibleAsSelected(playlistName);
  await expect(pages.songListPage.getSongElement(song1)).not.toBeVisible();
  await pages.songListPage.approveSelectedSongByKeyboard();
  await pages.songPreviewPage.navigateToGoNextByKeyboard();
  await pages.songPreviewPage.expectEnteredPlayerNameToBeVisibleInNextSong(player1, player1Name);
  await pages.songPreviewPage.expectEnteredPlayerNameToBeVisibleInNextSong(player2, player2Name);

  await pages.songPreviewPage.expectRecentPlayerListToContainName(updatedName);
  await pages.songPreviewPage.playTheSong();
  await expect(page.locator(p1CL)).toBeVisible();
  await page.waitForTimeout(1000); // otherwise the click might happen before the game actually starts
  await pages.gamePage.goToPauseMenu();
  await pages.gamePage.gotoResumeSong();
  await expect(pages.gamePage.resumeSongButton).not.toBeVisible();
  await page.keyboard.press('Backspace'); // go to pause menu
  await pages.gamePage.goToExitSong();
  await pages.postGame.skipScoresAnimation();
  await pages.postGame.goNext();
  await expect(pages.postGame.highscoresContainer).toContainText(updatedName);
});
