import { expect, test } from '@playwright/test';
import { txtfile } from './fixtures/newsongtxt';
import { initTestMode, mockSongs } from './helpers';
import {
  connectRemoteMic,
  openAndConnectRemoteMicDirectly,
  openAndConnectRemoteMicWithCode,
  openRemoteMic,
} from './steps/openAndConnectRemoteMic';

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

const songs = {
  polish1: {
    ID: 'e2e-skip-intro-polish',
  },
  polish2: {
    ID: 'zzz-last-polish-1994',
  },
  polish3: {
    ID: 'e2e-multitrack-polish-1994',
    name: 'multitrack',
  },
  spanish: {
    ID: 'e2e-pass-test-spanish-1994',
    name: 'pass',
  },
  french: {
    ID: 'e2e-croissant-french-1994',
  },
  engPol: {
    ID: 'e2e-english-polish-1994',
  },
  english1: {
    ID: 'e2e-christmas-english-1995',
  },
  english2: {
    ID: 'e2e-new-english-1995',
  },
  english3: {
    ID: 'e2e-single-english-1995',
  },
};

const languages = {
  spanish: 'Spanish',
  english: 'English',
};

test('Remote mic song list', async ({ page, context, browser, browserName }) => {
  const P1_Name = 'E2E Test Blue';
  const videoURL = 'https://www.youtube.com/watch?v=8YKAHgwLEMg';
  const convertedSongID = 'convert-test';

  test.fixme(browserName === 'firefox', 'Test fails super often on FF');
  test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic = await openRemoteMic(page, context, browser);
  await remoteMic.remoteMicMainPage.enterPlayerName(P1_Name);

  await test.step('Song list is available without connecting', async () => {
    await remoteMic.remoteMicMainPage.goToSongList();
    await remoteMic.remoteMicSongListPage.expectSongToBeVisible(songs.polish2.ID);
  });

  await test.step('Song list doesnt contain removed songs after connecting', async () => {
    await remoteMic.remoteMicSongListPage.goToMicrophonePage();
    await connectRemoteMic(remoteMic._page);

    await pages.smartphonesConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToEditSongs();
    await pages.editSongsPage.hideSong(songs.polish2.ID);
    await pages.editSongsPage.expectSongToBeHidden(songs.polish2.ID);
    await remoteMic.remoteMicSongListPage.expectSongNotToBeVisible(songs.polish2.ID);
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
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');

  await test.step('Song is visible in Favourite List after adding', async () => {
    await remoteMic.remoteMicMainPage.goToSongList();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.spanish.ID)).toBeVisible();
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songs.spanish.ID);
    await remoteMic.remoteMicSongListPage.expectFavouriteListToContainNumberOfSongs('1');
    await remoteMic.remoteMicSongListPage.goToFavouriteList();
    await remoteMic.remoteMicSongListPage.expectFavouriteListToBeSelected();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.spanish.ID)).toBeVisible();
  });

  await test.step('Deleting songs from Favourite List works - songs are not visible', async () => {
    await remoteMic.remoteMicSongListPage.goToAllSongsPlaylist();
    await remoteMic.remoteMicSongListPage.expectAllSongsPlaylistToBeSelected();
    await remoteMic.remoteMicSongListPage.removeSongFromFavouriteList(songs.spanish.ID);
    await remoteMic.remoteMicSongListPage.expectFavouriteListToContainNumberOfSongs('0');
    await remoteMic.remoteMicSongListPage.goToFavouriteList();
    await remoteMic.remoteMicSongListPage.expectFavouriteListToBeSelected();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.spanish.ID)).not.toBeVisible();
  });
});

test('Searching song in all and favourite songs list', async ({ page, browser }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');

  await test.step('All songs list - only searched song is visible in results', async () => {
    await remoteMic.remoteMicMainPage.goToSongList();
    await remoteMic.remoteMicSongListPage.expectAllSongsPlaylistToBeSelected();
    await remoteMic.remoteMicSongListPage.searchTheSong(songs.polish3.name);
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.polish3.ID)).toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.spanish.ID)).not.toBeVisible();

    await remoteMic.remoteMicSongListPage.searchInput.clear();
    await remoteMic.remoteMicSongListPage.searchTheSong(songs.spanish.name);
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.spanish.ID)).toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.polish3.ID)).not.toBeVisible();
  });

  await test.step('Favourite songs list - only searched song is visible in results', async () => {
    await remoteMic.remoteMicSongListPage.searchInput.clear();
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songs.polish3.ID);
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songs.spanish.ID);
    await remoteMic.remoteMicSongListPage.expectFavouriteListToContainNumberOfSongs('2');
    await remoteMic.remoteMicSongListPage.goToFavouriteList();
    await remoteMic.remoteMicSongListPage.searchTheSong(songs.polish3.name);

    test.fail(true, 'Searching songs in Favourite songs list does not work');
    await expect.soft(remoteMic.remoteMicSongListPage.getSongElement(songs.polish3.ID)).toBeVisible();
    await expect.soft(remoteMic.remoteMicSongListPage.getSongElement(songs.spanish.ID)).not.toBeVisible();

    await remoteMic.remoteMicSongListPage.searchInput.clear();
    await remoteMic.remoteMicSongListPage.searchTheSong(songs.spanish.name);

    test.fail(true, 'Searching songs in Favourite songs list does not work');
    await expect.soft(remoteMic.remoteMicSongListPage.getSongElement(songs.spanish.ID)).toBeVisible();
    await expect.soft(remoteMic.remoteMicSongListPage.getSongElement(songs.polish3.ID)).not.toBeVisible();
  });
});

test('Filtering all and favourites by song language ', async ({ page, browser }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');

  await test.step('Add songs to Favourites - for later', async () => {
    await remoteMic.remoteMicMainPage.goToSongList();
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songs.spanish.ID);
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songs.english3.ID);
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songs.polish2.ID);
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songs.engPol.ID);
  });

  await test.step('All songs list - filtering works, only songs in selected language are visible', async () => {
    await remoteMic.remoteMicSongListPage.goToSelectSongLanguage();
    await remoteMic.remoteMicSongLanguagesPage.ensureSongLanguageIsSelected(languages.spanish);
    await remoteMic.remoteMicSongLanguagesPage.goBackToSongList();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.spanish.ID)).toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.english3.ID)).not.toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.polish2.ID)).not.toBeVisible();
  });

  await test.step('All songs list - deselecting the language and searching for a bilingual song works', async () => {
    await remoteMic.remoteMicSongListPage.goToSelectSongLanguage();
    await remoteMic.remoteMicSongLanguagesPage.ensureSongLanguageIsDeselected(languages.spanish);
    await remoteMic.remoteMicSongLanguagesPage.ensureSongLanguageIsSelected(languages.english);
    await remoteMic.remoteMicSongLanguagesPage.goBackToSongList();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.english3.ID)).toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.engPol.ID)).toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.polish2.ID)).not.toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.spanish.ID)).not.toBeVisible();
  });

  await test.step('Favourite songs list - language settings should be remembered', async () => {
    await remoteMic.remoteMicSongListPage.goToFavouriteList();
    await remoteMic.remoteMicSongListPage.goToSelectSongLanguage();
    await remoteMic.remoteMicSongLanguagesPage.expectSongLanguageToBeSelected(languages.english);
    await remoteMic.remoteMicSongLanguagesPage.goBackToSongList();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.english3.ID)).toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.engPol.ID)).toBeVisible();

    test.fail(true, 'Language filtering does not work in Favourite songs list');
    await expect.soft(remoteMic.remoteMicSongListPage.getSongElement(songs.polish2.ID)).not.toBeVisible();
    await expect.soft(remoteMic.remoteMicSongListPage.getSongElement(songs.spanish.ID)).not.toBeVisible();
  });

  await test.step('Favourite songs list - after unchecking the last language, all languages are activated', async () => {
    await remoteMic.remoteMicSongListPage.goToSelectSongLanguage();
    await remoteMic.remoteMicSongLanguagesPage.ensureAllSongLanguagesAreDeselected();
    await remoteMic.remoteMicSongLanguagesPage.goBackToSongList();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.english3.ID)).toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.engPol.ID)).toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.polish2.ID)).toBeVisible();
    await expect(remoteMic.remoteMicSongListPage.getSongElement(songs.spanish.ID)).toBeVisible();
  });
});

test('Selecting a song using the `select` button on the remoteMic, when selected languages on desktop and remoteMic apps are the same - works', async ({
  page,
  browser,
}) => {
  const player1 = {
    num: 0,
    name: 'Player 1 - Ren',
  };

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic = await openAndConnectRemoteMicWithCode(page, browser, player1.name);

  await pages.smartphonesConnectionPage.expectPlayerNameToBe(player1.num, player1.name);

  await test.step('On the desktop app - ensure all languages are selected', async () => {
    await pages.smartphonesConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureAllLanguagesAreSelected();
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('On the remoteMic app - ensure all languages are selected too', async () => {
    await remoteMic.remoteMicMainPage.goToSongList();
    await remoteMic.remoteMicSongListPage.goToSelectSongLanguage();
    await remoteMic.remoteMicSongLanguagesPage.ensureAllSongLanguagesAreDeselected(); // = selected
    await remoteMic.remoteMicSongLanguagesPage.goBackToSongList();
  });

  await test.step('Select a few songs on the remoteMic - they should open as a preview on the desktop app', async () => {
    await remoteMic.remoteMicSongListPage.chooseSongForPreview(songs.polish1.ID);
    test.fail(true, 'Select button does not work for first position on the song list');
    await expect.soft(pages.songPreviewPage.songPreviewElement).toHaveAttribute('data-song', songs.polish1.ID);

    await remoteMic.remoteMicSongListPage.chooseSongForPreview(songs.french.ID);
    await pages.songPreviewPage.expectPreviewSongToBe(songs.french.ID);

    await remoteMic.remoteMicSongListPage.chooseSongForPreview(songs.spanish.ID);
    await pages.songPreviewPage.expectPreviewSongToBe(songs.spanish.ID);

    await remoteMic.remoteMicSongListPage.chooseSongForPreview(songs.english1.ID);
    await pages.songPreviewPage.expectPreviewSongToBe(songs.english1.ID);
  });
});
