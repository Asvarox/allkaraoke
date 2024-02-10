import { expect, test } from '@playwright/test';
import { txtfile } from './fixtures/newsongtxt';
import { initTestMode, mockSongs } from './helpers';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});
const authorName = 'allKaraoke Test';
const sourceURL = 'https://example.com/source-url';
const videoID = 'W9nZ6u15yis';
const songArtist = 'convert';
const songTitle = 'test';
const songYear = '1992';
const songLanguage = 'English';
const songID = 'convert-test';
const player1 = 0;
const playerName = 'All-Karaoke';
const englishPlaylist = 'English';
const oldiePlaylist = 'Oldies';

test('Convert and sing a song', async ({ page }) => {
  test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.skipToMainMenu();

  await test.step('Go to convert new song', async () => {
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToEditSongs();
    await pages.editSongsPage.goToImportUltrastar();
  });

  await test.step('Enter basic song info', async () => {
    await expect(pages.songEditBasicInfoPage.pageContainer).toBeVisible();
    await pages.songEditBasicInfoPage.enterSourceURL(sourceURL);
    await pages.songEditBasicInfoPage.enterSongTXT(txtfile);
  });

  await test.step('Enter info about author and video', async () => {
    await pages.songEditBasicInfoPage.goToAuthorAndVideoStep();
    await expect(pages.songEditAuthorAndVideoPage.pageContainer).toBeVisible();
    await pages.songEditAuthorAndVideoPage.enterAuthorName(authorName);
    await pages.songEditAuthorAndVideoPage.enterVideoURL(`https://www.youtube.com/watch?v=${videoID}`);
  });

  await test.step('Go to metadata and check the song info', async () => {
    await pages.songEditAuthorAndVideoPage.goToSyncLyricsStep();
    await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
    await pages.songEditSyncLyricsToVideoPage.goToMetadataStep();
    await expect(pages.songEditMetadataPage.pageContainer).toBeVisible();
    await expect(pages.songEditMetadataPage.songTitleInput).toHaveValue(songTitle);
    await expect(pages.songEditMetadataPage.songArtistInput).toHaveValue(songArtist);
    await expect(pages.songEditMetadataPage.releaseYearInput).toHaveValue(songYear);
    await expect(pages.songEditMetadataPage.songLanguageElement).toContainText(songLanguage);
  });

  await test.step('Go back to main menu', async () => {
    await pages.songEditMetadataPage.saveAndGoToEditSongsPage();
    await pages.editSongsPage.disagreeToShareAddSongs();
    await pages.editSongsPage.goToMainMenu();
  });

  await test.step('Select computer`s mic', async () => {
    await pages.mainMenuPage.goToSetupMicrophones();
    await pages.inputSelectionPage.selectComputersMicrophone();
  });

  await test.step('Select song language', async () => {
    await pages.computersMicConnectionPage.goToMainMenuPage();
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(songLanguage);
  });

  await test.step('Search and pick up converted song', async () => {
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.songListPage.searchButton.click();
    await expect(pages.songListPage.searchInput).toBeVisible();
    await page.keyboard.type(songID);
    await pages.songListPage.openPreviewForSong(songID);
    await pages.songPreviewPage.goNext();
  });

  await test.step('Set player`s name', async () => {
    await pages.songPreviewPage.getPlayerNameInput(player1).click();
    await pages.songPreviewPage.enterPlayerNameWithKeyboard(playerName);
  });

  await test.step('Play the song', async () => {
    await pages.songPreviewPage.playTheSong();
    await expect(pages.gamePage.getSongLyricsForPlayerElement(player1)).toBeVisible();
  });

  await test.step('Check if the entered player`s name is displayed', async () => {
    await expect(pages.postGameResultsPage.skipScoreElement).toBeVisible({ timeout: 20_000 });
    await pages.postGameResultsPage.expectPlayerNameToBeDisplayed(player1, playerName);
  });

  await test.step('Check if the song is visible in the new-songs category', async () => {
    await pages.postGameResultsPage.goToPostGameHighScoresStep();
    await pages.postGameHighScoresPage.goToSelectNewSong();
    await pages.songListPage.expectSongToBeVisibleAsNew(songID);
  });

  await test.step('Go to language playlist and check visibility', async () => {
    await pages.songListPage.goToPlaylist(englishPlaylist);
    await pages.songListPage.expectPlaylistToBeSelected(englishPlaylist);
    await expect(pages.songListPage.getSongElement(songID)).toBeVisible();
    await pages.songListPage.expectSongToBeVisibleAsNew(songID);
  });

  await test.step('Go to playlist containing the song`s release year and check visibility', async () => {
    await pages.songListPage.goToPlaylist(oldiePlaylist);
    await pages.songListPage.expectPlaylistToBeSelected(oldiePlaylist);
    await expect(pages.songListPage.getSongElement(songID)).toBeVisible();
    await pages.songListPage.expectSongToBeVisibleAsNew(songID);
  });

  await test.step('Song should be marked as played today', async () => {
    //await pages.songListPage.expectSongToBeMarkedAsPlayedToday(songID);
  });
});
