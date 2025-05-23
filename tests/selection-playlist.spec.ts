import { expect, test } from '@playwright/test';

import initialise from './PageObjects/initialise';
import { txtfile } from './fixtures/newsongselectiontxt';
import { initTestMode, mockRandom, mockSongs } from './helpers';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
  await page.route('/mostPopularSongs.json', (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        English: ['e2e-english-polish-1994', 'e2e-new-english-1995', 'e2e-single-english-1995'],
      }),
    }),
  );
  await mockRandom({ page, context }, 0);
});

const selectionPlaylist = 'Selection';
const engPlaylist = 'English';
const engLanguage = 'English';

const convertedSong = {
  ID: 'selection-test-new-convert-song',
  artist: 'Selection test',
  title: 'New convert song',
  author: 'Selection txt',
  sourceURL: 'https://example.com/source-url',
  videoID: 'koBUXESJZ8g',
};

const unpopularSong = {
  ID: 'e2e-christmas-english-1995',
  title: 'New Christmas',
};

test('Adding completed song to the Selection playlist', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Select Advanced setup', async () => {
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectAdvancedSetup();
    await pages.advancedConnectionPage.goToMainMenu();
  });

  await test.step('Ensure song language is selected', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(engLanguage);
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Search and play the entire song - ensure song is not visible in Selection playlist', async () => {
    await pages.songListPage.goToPlaylist(selectionPlaylist);
    await expect(await pages.songListPage.getSongElement(unpopularSong.ID)).not.toBeVisible();
    await pages.songListPage.searchSong(unpopularSong.title);
    await pages.songListPage.focusSong(unpopularSong.ID);
    await pages.songListPage.openPreviewForSong(unpopularSong.ID);
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.playTheSong();
  });

  await test.step('Skip to the Song list', async () => {
    await pages.postGameResultsPage.skipScoresAnimation();
    await pages.postGameResultsPage.goToHighScoresStep();
    await pages.postGameHighScoresPage.goToSongList();
  });

  await test.step('After singing, the completed song should be added to Selection playlist as one of favourite', async () => {
    await pages.songListPage.goToPlaylist(selectionPlaylist);
    await expect(await pages.songListPage.getSongElement(unpopularSong.ID)).toBeVisible();
    await pages.songListPage.expectSongToBeMarkedAsPlayedToday(unpopularSong.ID);
  });
});

test('Adding song in above 80% complete to the Selection playlist', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Go to the Song languages - choose correct one', async () => {
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToSelectSongLanguage();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(engLanguage);
    await pages.songLanguagesPage.goBackToMainMenu();
  });

  await test.step('Go to the Song list and choose the song - ensure song is not visible in Selection playlist yet', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songListPage.expectPlaylistToBeSelected(selectionPlaylist);
    await expect(await pages.songListPage.getSongElement(unpopularSong.ID)).not.toBeVisible();
    await pages.songListPage.goToPlaylist(engPlaylist);
    await pages.songListPage.focusSong(unpopularSong.ID);
    await pages.songListPage.openPreviewForSong(unpopularSong.ID);
  });

  await test.step('Select Advanced setup', async () => {
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectAdvancedSetup();
    await pages.advancedConnectionPage.goToSongPreview();
  });

  await test.step('Play the song and after above 80% complete - exit the song', async () => {
    await pages.songPreviewPage.playTheSong();
    await page.waitForTimeout(3_500);
    await pages.gamePage.exitSong();
  });

  await test.step('Skip to the Song list', async () => {
    await pages.postGameResultsPage.skipScoresAnimation();
    await pages.postGameResultsPage.goToHighScoresStep();
    await pages.postGameHighScoresPage.goToSongList();
  });

  await test.step('A song that is more than 80% complete, should be added to the Selection playlist', async () => {
    await pages.songListPage.goToPlaylist(selectionPlaylist);
    await expect(await pages.songListPage.getSongElement(unpopularSong.ID)).toBeVisible();
  });
});

test('A song that is less than 80% complete is not adding to the Selection playlist', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Ensure song language is selected', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(engLanguage);
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Search the song - expect song is not visible in Selection playlist yet', async () => {
    await pages.songListPage.expectPlaylistToBeSelected(selectionPlaylist);
    await pages.songListPage.closeTheSelectionPlaylistTip();
    await expect(await pages.songListPage.getSongElement(unpopularSong.ID)).not.toBeVisible();
    await pages.songListPage.searchSong(unpopularSong.title);
  });

  await test.step('Toggle game mode to `Cooperation`', async () => {
    await pages.songListPage.openPreviewForSong(unpopularSong.ID);
    await pages.songPreviewPage.toggleGameMode();
    await pages.songPreviewPage.toggleGameMode();
  });

  await test.step('Go to select Advanced setup and play the song', async () => {
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectAdvancedSetup();
    await pages.advancedConnectionPage.goToSongPreview();
    await pages.songPreviewPage.playTheSong();
  });

  await test.step('After reach the expected score - exit the game', async () => {
    await pages.gamePage.waitForPlayersScoreToBeGreaterThan(100);
    await pages.gamePage.exitSong();
    await pages.rateUnfinishedSongPage.skipSongRating();
  });

  await test.step('Skip to the Song list', async () => {
    await pages.postGameResultsPage.skipScoresAnimation();
    await pages.postGameResultsPage.goToHighScoresStep();
    await pages.postGameHighScoresPage.goToSongList();
  });

  await test.step('A song that is less then 80% complete, should not be added to the Selection playlist', async () => {
    await pages.songListPage.goBackToMainMenu();
    await pages.mainMenuPage.goToSingSong();
    await pages.songListPage.goToPlaylist(selectionPlaylist);
    await expect(await pages.songListPage.getSongElement(unpopularSong.ID)).not.toBeVisible();
    await pages.songListPage.searchSong(unpopularSong.title);
    await pages.songListPage.expectSongToBeMarkedAsPlayedToday(unpopularSong.ID);
  });
});

test('Selection playlist contain songs marked as new and popular as well', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Go to the Edit Songs Page', async () => {
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToEditSongs();
  });

  await test.step('Go to convert a new song and enter some song data', async () => {
    await pages.editSongsPage.goToConvertSong();
    await pages.songEditBasicInfoPage.enterSourceURL(convertedSong.sourceURL);
    await pages.songEditBasicInfoPage.enterSongTXT(txtfile);
    await pages.songEditBasicInfoPage.goToAuthorAndVideoStep();

    await pages.songEditAuthorAndVideoPage.enterAuthorName(convertedSong.author);
    await pages.songEditAuthorAndVideoPage.enterVideoURL(`https://www.youtube.com/watch?v=${convertedSong.videoID}`);
    await pages.songEditAuthorAndVideoPage.goToSyncLyricsStep();

    await pages.songEditSyncLyricsToVideoPage.goToMetadataStep();
    await expect(pages.songEditMetadataPage.songArtistInput).toHaveValue(convertedSong.artist);
    await expect(pages.songEditMetadataPage.songTitleInput).toHaveValue(convertedSong.title);
    await pages.songEditMetadataPage.saveAndGoToEditSongsPage();
  });

  await test.step('Go to the Song List', async () => {
    await pages.editSongsPage.disagreeToShareAddSongs();
    await pages.editSongsPage.goToMainMenu();
    await pages.mainMenuPage.goToSingSong();
  });

  await test.step('Ensure song language is selected', async () => {
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(engLanguage);
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('When the Selection playlist is selected, a tip about how the playlist works should be visible', async () => {
    await pages.songListPage.expectPlaylistToBeSelected(selectionPlaylist);
    await expect(pages.songListPage.selectionPlaylistTip).toBeVisible();
  });

  await test.step('Selection playlist should contain both new and popular songs', async () => {
    await pages.songListPage.expectPlaylistContainSongsMarkedAsPopular();
    await pages.songListPage.expectPlaylistContainSongsMarkedAsNew();
  });
});

test('After singing a popular song, the popularity indicator changes to `played today`', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Go to the Song Languages - choose correct one', async () => {
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToSelectSongLanguage();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(engLanguage);
    await pages.songLanguagesPage.goBackToMainMenu();
  });

  await test.step('Go to the Selection playlist and select a popular song', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songListPage.expectPlaylistToBeSelected(selectionPlaylist);
    await pages.songListPage.expectPlaylistContainSongsMarkedAsPopular();
    await pages.songListPage.approveSelectedSongByKeyboard();
  });

  const popSongID = await pages.songListPage.getSelectedSongID;

  await test.step('Go to Select Advanced setup and play the song', async () => {
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectAdvancedSetup();
    await pages.advancedConnectionPage.goToSongPreview();
    await pages.songPreviewPage.playTheSong();
  });

  await test.step('Skip to the Song List', async () => {
    await pages.postGameResultsPage.skipScoresAnimation();
    await pages.postGameResultsPage.goToHighScoresStep();
    await pages.postGameHighScoresPage.goToSongList();
  });

  await test.step('Check if the selection-playlist tip is visible and can be closed', async () => {
    await pages.songListPage.expectPlaylistToBeSelected(selectionPlaylist);
    await expect(pages.songListPage.selectionPlaylistTip).toBeVisible();
    await pages.songListPage.closeTheSelectionPlaylistTip();
    await expect(pages.songListPage.selectionPlaylistTip).not.toBeVisible();
  });

  await test.step('After singing, the song indicator should be changed from `popular` to `played today`', async () => {
    await pages.songListPage.expectSongToBeMarkedAsPlayedToday(popSongID!);
  });
});
