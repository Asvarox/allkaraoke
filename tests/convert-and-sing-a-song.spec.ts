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

const player1_name = 'All';
const player2_name = 'Karaoke';
const engPlaylist = 'English';

const song = {
  ID: 'convert-test',
  year: '1992',
  artist: 'convert',
  title: 'test',
  language: 'English',
  sourceURL: 'https://example.com/source-url',
  lyricsFileAuthor: 'allKaraoke Test',
  videoID: 'koBUXESJZ8g',
} as const;

test('Convert and sing a song', async ({ page }) => {
  test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Go to convert new song', async () => {
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToEditSongs();
    await pages.editSongsPage.goToConvertSong();
  });

  await test.step('Enter basic song info', async () => {
    await expect(pages.songEditBasicInfoPage.pageContainer).toBeVisible();
    await pages.songEditBasicInfoPage.enterSourceURL(song.sourceURL);
    await pages.songEditBasicInfoPage.enterSongTXT(txtfile);
  });

  await test.step('Enter info about author and video', async () => {
    await pages.songEditBasicInfoPage.goToAuthorAndVideoStep();
    await expect(pages.songEditAuthorAndVideoPage.pageContainer).toBeVisible();
    await pages.songEditAuthorAndVideoPage.enterLyricsFileAuthorName(song.lyricsFileAuthor);
    await pages.songEditAuthorAndVideoPage.enterVideoURL(`https://www.youtube.com/watch?v=${song.videoID}`);
  });

  await test.step('Go to metadata and check the song info', async () => {
    await pages.songEditAuthorAndVideoPage.goToSyncLyricsStep();
    await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
    await pages.songEditSyncLyricsToVideoPage.goToMetadataStep();
    await expect(pages.songEditMetadataPage.pageContainer).toBeVisible();
    await expect(pages.songEditMetadataPage.songTitleInput).toHaveValue(song.title);
    await expect(pages.songEditMetadataPage.songArtistInput).toHaveValue(song.artist);
    await expect(pages.songEditMetadataPage.releaseYearInput).toHaveValue(song.year);
    await expect(pages.songEditMetadataPage.songLanguageElement).toContainText(song.language);
  });

  await test.step('Go back to main menu', async () => {
    await pages.songEditMetadataPage.saveAndGoToEditSongsPage();
    await pages.editSongsPage.disagreeToShareAddSongs();
    await pages.editSongsPage.goToMainMenu();
  });

  await test.step('Select advanced setup', async () => {
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectAdvancedSetup();
  });

  await test.step('Select song language', async () => {
    await pages.advancedConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureLanguageToBeSelected(song.language);
  });

  await test.step('Search and pick up converted song', async () => {
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.songListPage.searchSong(`${song.artist} ${song.title}`);
    await pages.songListPage.openSongPreview(song.ID);
    await pages.songPreviewPage.goNext();
  });

  await test.step('Set players names', async () => {
    await pages.songPreviewPage.getPlayerNameInput('p1').click();
    await pages.songPreviewPage.enterPlayerNameWithKeyboard(player1_name);

    await pages.songPreviewPage.getPlayerNameInput('p2').click();
    await pages.songPreviewPage.enterPlayerNameWithKeyboard(player2_name);
  });

  await test.step('Play the song', async () => {
    await pages.songPreviewPage.playTheSong();
    await expect(pages.gamePage.getPlayerLyricsContainer('p1')).toBeVisible();
    await expect(pages.gamePage.getPlayerLyricsContainer('p2')).toBeVisible();
  });

  await test.step('Check if the entered players names are displayed', async () => {
    await expect(pages.postGameResultsPage.skipScoresButton).toBeVisible({ timeout: 20_000 });
    await pages.postGameResultsPage.expectCoopPlayersNamesToBe(player1_name, player2_name);
  });

  await test.step('Check if the song is visible in the new-songs category', async () => {
    await pages.postGameResultsPage.waitForPlayerScoreToBeGreaterThan(50);
    await pages.postGameResultsPage.skipScoresAnimation();
    await pages.postGameResultsPage.goToHighScoresStep();
    await pages.postGameHighScoresPage.goToSongList();
    await pages.songListPage.expectSongToBeMarkedAsNewInNewGroup(song.ID);
  });

  await test.step('Go to language playlist and check visibility', async () => {
    await pages.songListPage.goToPlaylist(engPlaylist);
    await pages.songListPage.expectPlaylistToBeSelected(engPlaylist);
    await expect(await pages.songListPage.getSongElement(song.ID)).toBeVisible();
    await pages.songListPage.expectSongToBeMarkedAsNewInNewGroup(song.ID);
  });

  await test.step('Song should be marked as played today', async () => {
    await pages.songListPage.expectSongToBeMarkedAsPlayedToday(song.ID);
  });
});
