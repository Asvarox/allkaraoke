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
    await remoteMic.remoteMicSongListPage.expectSongToBeVisible(songID);
  });

  await test.step('Song list doesnt contain removed songs after connecting', async () => {
    await remoteMic.remoteMicSongListPage.goToMicrophonePage();
    await connectRemoteMic(remoteMic._page);

    await pages.smartphonesConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToEditSongs();
    await pages.editSongsPage.hideSong(songID);
    await pages.editSongsPage.expectSongToBeHidden(songID);
    await remoteMic.remoteMicSongListPage.expectSongNotToBeVisible(songID);
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
    await remoteMic.remoteMicSongListPage.expectSongToBeVisible(convertedSongID);
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
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songID)).toBeVisible();
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songID);
    await remoteMic.remoteMicSongListPage.expectFavouriteListToContainNumberOfSongs('1');
    await remoteMic.remoteMicSongListPage.goToFavouriteList();
    await remoteMic.remoteMicSongListPage.expectFavouriteListToBeSelected();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songID)).toBeVisible();
  });

  await test.step('Deleting songs from Favourite List works - songs are not visible', async () => {
    await remoteMic.remoteMicSongListPage.goToAllSongsPlaylist();
    await remoteMic.remoteMicSongListPage.expectAllSongsPlaylistToBeSelected();
    await remoteMic.remoteMicSongListPage.removeSongFromFavouriteList(songID);
    await remoteMic.remoteMicSongListPage.expectFavouriteListToContainNumberOfSongs('0');
    await remoteMic.remoteMicSongListPage.goToFavouriteList();
    await remoteMic.remoteMicSongListPage.expectFavouriteListToBeSelected();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songID)).not.toBeVisible();
  });
});

test('Searching song in all and favourite songs list', async ({ page, browser }) => {
  const song1 = {
    name: 'multitrack',
    ID: 'e2e-multitrack-polish-1994',
  };

  const song2 = {
    name: 'pass',
    ID: 'e2e-pass-test-spanish-1994',
  };

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');

  await test.step('All songs list - only searching song is visible in results', async () => {
    await remoteMic.remoteMicMainPage.goToSongList();
    await remoteMic.remoteMicSongListPage.expectAllSongsPlaylistToBeSelected();
    await remoteMic.remoteMicSongListPage.searchTheSong(song1.name);
    await expect(remoteMic.remoteMicSongListPage.getSongElement(song1.ID)).toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(song2.ID)).not.toBeVisible();

    await remoteMic.remoteMicSongListPage.searchInput.clear();
    await remoteMic.remoteMicSongListPage.searchTheSong(song2.name);
    await expect(remoteMic.remoteMicSongListPage.getSongElement(song2.ID)).toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(song1.ID)).not.toBeVisible();
  });

  await test.step('Favourite songs list - only searching song is visible in results', async () => {
    await remoteMic.remoteMicSongListPage.searchInput.clear();
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(song1.ID);
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(song2.ID);
    await remoteMic.remoteMicSongListPage.expectFavouriteListToContainNumberOfSongs('2');
    await remoteMic.remoteMicSongListPage.goToFavouriteList();
    await remoteMic.remoteMicSongListPage.searchTheSong(song1.name);

    test.fail(true, 'Searching songs in Favourite songs list does not work');
    await expect.soft(remoteMic.remoteMicSongListPage.getSongElement(song1.ID)).toBeVisible();
    await expect.soft(remoteMic.remoteMicSongListPage.getSongElement(song2.ID)).not.toBeVisible();

    await remoteMic.remoteMicSongListPage.searchInput.clear();
    await remoteMic.remoteMicSongListPage.searchTheSong(song2.name);

    test.fail(true, 'Searching songs in Favourite songs list does not work');
    await expect.soft(remoteMic.remoteMicSongListPage.getSongElement(song2.ID)).toBeVisible();
    await expect.soft(remoteMic.remoteMicSongListPage.getSongElement(song1.ID)).not.toBeVisible();
  });
});

test('Filtering all and favourites by song language ', async ({ page, browser }) => {
  const songList = {
    spanish: 'e2e-pass-test-spanish-1994',
    english: 'e2e-single-english-1995',
    polish: 'zzz-last-polish-1994',
    engPol: 'e2e-english-polish-1994',
  };

  const languages = {
    spanish: 'Spanish',
    english: 'English',
  };

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');

  await test.step('Add songs to Favourites - for later', async () => {
    await remoteMic.remoteMicMainPage.goToSongList();
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songList.spanish);
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songList.english);
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songList.polish);
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songList.engPol);
  });

  await test.step('All songs list - filtering works, only songs in selected language are visible', async () => {
    await remoteMic.remoteMicSongListPage.goToSelectSongLanguage();
    await remoteMic.remoteMicSongLanguagesPage.ensureSongLanguageIsSelected('Spanish');
    await remoteMic.remoteMicSongLanguagesPage.goBackToSongList();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songList.spanish)).toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songList.english)).not.toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songList.polish)).not.toBeVisible();
  });

  await test.step('All songs list - deselecting the language and searching for a bilingual song works', async () => {
    await remoteMic.remoteMicSongListPage.goToSelectSongLanguage();
    await remoteMic.remoteMicSongLanguagesPage.ensureSongLanguageIsDeselected(languages.spanish);
    await remoteMic.remoteMicSongLanguagesPage.ensureSongLanguageIsSelected(languages.english);
    await remoteMic.remoteMicSongLanguagesPage.goBackToSongList();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songList.english)).toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songList.engPol)).toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songList.polish)).not.toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songList.spanish)).not.toBeVisible();
  });

  await test.step('Favourite songs list - language settings should be remembered', async () => {
    await remoteMic.remoteMicSongListPage.goToFavouriteList();
    await remoteMic.remoteMicSongListPage.goToSelectSongLanguage();
    await remoteMic.remoteMicSongLanguagesPage.expectSongLanguageToBeSelected(languages.english);
    await remoteMic.remoteMicSongLanguagesPage.goBackToSongList();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songList.english)).toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songList.engPol)).toBeVisible();

    test.fail(true, 'Language filtering does not work in Favourite songs list');
    await expect.soft(remoteMic.remoteMicSongListPage.getSongElement(songList.polish)).not.toBeVisible();
    await expect.soft(remoteMic.remoteMicSongListPage.getSongElement(songList.spanish)).not.toBeVisible();
  });
});
