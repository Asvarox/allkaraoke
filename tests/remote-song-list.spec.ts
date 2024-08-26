import { expect, test } from '@playwright/test';
import { txtfile } from './fixtures/newsongtxt';
import { initTestMode, mockSongs } from './helpers';
import { connectRemoteMic, openAndConnectRemoteMicDirectly, openRemoteMic } from './steps/openAndConnectRemoteMic';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

// Service worker caches index.json which breaks playwright's request intercept (mocking of song list)
// Not disabling it globally so in case SW breaks the app it is caught by other tests
//test.use({ serviceWorkers: 'block' });

const P1_Name = 'E2E Test Blue';
const songID = 'zzz-last-polish-1994';
const videoURL = 'https://www.youtube.com/watch?v=8YKAHgwLEMg';
const convertedSongID = 'convert-test';

test('Remote mic song list', async ({ page, context, browser, browserName }) => {
  test.fixme(browserName === 'firefox', 'Test fails super often on FF');
  test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic = await openRemoteMic(page, context, browser);
  await remoteMic.remoteMicMainPage.enterPlayerName(P1_Name);

  await test.step('Song list is available without connecting', async () => {
    await remoteMic.remoteMicMainPage.goToSongList();
    await remoteMic.remoteSongListPage.expectSongToBeVisible(songID);
  });

  await test.step('Song list doesnt contain removed songs after connecting', async () => {
    await remoteMic.remoteSongListPage.goToMicrophonePage();
    await connectRemoteMic(remoteMic._page);

    await pages.smartphonesConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToEditSongs();
    await pages.editSongsPage.hideSong(songID);
    await pages.editSongsPage.expectSongToBeHidden(songID);
    await remoteMic.remoteSongListPage.expectSongNotToBeVisible(songID);
  });

  await test.step('Song list contains custom songs after connecting', async () => {
    await pages.editSongsPage.goToConvertSong();
    await pages.songEditBasicInfoPage.enterSongTXT(txtfile);
    await pages.songEditBasicInfoPage.goToAuthorAndVideoStep();
    await pages.songEditAuthorAndVideoPage.enterVideoURL(videoURL);
    await pages.songEditAuthorAndVideoPage.goToSyncLyricsStep();
    await pages.songEditSyncLyricsToVideoPage.goToMetadataStep();
    await pages.songEditMetadataPage.saveAndGoToEditSongsPage();
    await pages.editSongsPage.disagreeToShareAddSongs();
    await pages.editSongsPage.expectSongToBeVisible(convertedSongID);
    await remoteMic.remoteMicMainPage.goToSongList();
    await remoteMic.remoteSongListPage.expectSongToBeVisible(convertedSongID);
  });
});

test('Adding and removing songs from Favourite list', async ({ page, browser, browserName }) => {
  const songID = 'e2e-pass-test-spanish-1994';

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');

  await test.step('Song is visible in Favourite List after adding', async () => {
    await remoteMic.remoteMicMainPage.goToSongList();
    await expect(remoteMic.remoteSongListPage.getSongElement(songID)).toBeVisible();
    await remoteMic.remoteSongListPage.addSongToFavouriteList(songID);
    await remoteMic.remoteSongListPage.expectFavouriteListToContainNumberOfSongs('1');
    await remoteMic.remoteSongListPage.goToFavouriteList();
    await remoteMic.remoteSongListPage.expectFavouriteListToBeSelected();
    await expect(remoteMic.remoteSongListPage.getSongElement(songID)).toBeVisible();
  });

  await test.step('Deleting songs from Favourite List works - songs are not visible', async () => {
    await remoteMic.remoteSongListPage.goToAllSongsPlaylist();
    await remoteMic.remoteSongListPage.expectAllSongsPlaylistToBeSelected();
    await remoteMic.remoteSongListPage.removeSongFromFavouriteList(songID);
    await remoteMic.remoteSongListPage.expectFavouriteListToContainNumberOfSongs('0');
    await remoteMic.remoteSongListPage.goToFavouriteList();
    await remoteMic.remoteSongListPage.expectFavouriteListToBeSelected();
    await expect(remoteMic.remoteSongListPage.getSongElement(songID)).not.toBeVisible();
  });
});

test('Searching song in all and favourites list', async ({ page, browser }) => {
  const song1 = {
    name: 'multitrack',
    ID: 'e2e-multitrack-polish-1994',
  };

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');

  await remoteMic.remoteMicMainPage.goToSongList();
  await remoteMic.remoteSongListPage.expectAllSongsPlaylistToBeSelected();
  await remoteMic.remoteSongListPage.searchTheSong(song1.name);
  await expect(remoteMic.remoteSongListPage.getSongElement(song1.ID)).toBeVisible();
  await remoteMic.remoteSongListPage.searchInput.clear();
});
