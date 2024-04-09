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

const convertedSong = {
  ID: 'selection-test-new-convert-song',
  artist: 'Selection test',
  title: 'New convert song',
  author: 'Selection txt',
  sourceURL: 'https://example.com/source-url',
  videoID: 'W9nZ6u15yis',
  language: 'English',
};

test('Selection playlist contain songs marked as new and popular', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Skip to the Edit Songs', async () => {
    await pages.inputSelectionPage.skipToMainMenu();
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
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(convertedSong.language);
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('When the Selection playlist is selected, a tip about how the playlist works should be visible', async () => {
    await pages.songListPage.expectPlaylistToBeSelected(selectionPlaylist);
    await expect(pages.songListPage.selectionPlaylistTip).toBeVisible();
  });

  await test.step('Selection playlist should contain both new and popular songs', async () => {
    await pages.songListPage.expectPlaylistContainSongsMarkedAsNew();
    await pages.songListPage.expectPlaylistContainSongsMarkedAsPopular();
  });
});

test('After singing a popular song, the popularity indicator changes to `played today`', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Select Advanced setup', async () => {
    await pages.inputSelectionPage.selectAdvancedSetup();
    await pages.advancedConnectionPage.goToMainMenu();
  });

  await test.step('Go to the Song Languages - choose correct one', async () => {
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToSelectSongLanguage();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(convertedSong.language);
    await pages.songLanguagesPage.goBackToMainMenu();
  });

  await test.step('Go to the Selection playlist and select a popular song', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songListPage.expectPlaylistToBeSelected(selectionPlaylist);
    await pages.songListPage.expectPlaylistContainSongsMarkedAsPopular();
    await pages.songListPage.approveSelectedSongByKeyboard();
  });

  const popSongID = await pages.songListPage.getSelectedSongID;

  await test.step('Play the song', async () => {
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.playTheSong();
    await pages.gamePage.skipIntro();
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

  await test.step('After singing, the song indicator should be changed from `popular` to `played`', async () => {
    await pages.songListPage.expectSongToBeMarkedAsPlayedToday(popSongID!);
  });
});
