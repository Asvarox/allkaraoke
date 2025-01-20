import { expect, test } from '@playwright/test';
import initialise from './PageObjects/initialise';
import { initTestMode, mockSongs } from './helpers';
import { openAndConnectRemoteMicWithCode } from './steps/openAndConnectRemoteMic';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

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
} as const;

test('Adding and removing song from the remote mic playlist on desktop app works', async ({ page, browser }) => {
  const playerName = 'Player1';
  const remoteMicsPlaylistName = 'remote-mics';

  await test.step('Ensure that all languages are selected', async () => {
    await page.goto('/');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureAllLanguagesAreSelected();
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Connect remote mic by QR code', async () => {
    await expect(pages.songListPage.getPlaylistElement(remoteMicsPlaylistName)).not.toBeVisible();
    await pages.songListPage.toolbar.quickConnectPhone();
  });

  const remoteMic = await openAndConnectRemoteMicWithCode(page, browser, playerName);

  await test.step('After first connecting, the empty remote mic playlist should appear on desktop app', async () => {
    await pages.songListPage.toolbar.closeQuickConnectPhone();
    await expect(pages.songListPage.getPlaylistElement(remoteMicsPlaylistName)).toBeVisible();
    await pages.songListPage.goToPlaylist(remoteMicsPlaylistName);
    await pages.songListPage.expectPlaylistToBeSelected(remoteMicsPlaylistName);
    await expect(pages.songListPage.remoteMicPlaylistTip).toBeVisible();
    await expect(pages.songListPage.emptyPlaylistAlert).toBeVisible();
  });

  await test.step('After adding songs to favourite-list on remote mic, the songs should also appear in the playlist', async () => {
    await remoteMic.remoteMicMainPage.remoteTabBar.goToSongList();
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songs.english1.ID);
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songs.polish2.ID);
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songs.spanish.ID);
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songs.french.ID);
    await remoteMic.remoteMicSongListPage.goToFavouriteList();
    await remoteMic.remoteMicSongListPage.expectFavouriteListToContainNumberOfSongs('4');

    await pages.songListPage.goToPlaylist(remoteMicsPlaylistName);
    await expect(pages.songListPage.emptyPlaylistAlert).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.english1.ID)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish2.ID)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.spanish.ID)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.french.ID)).toBeVisible();
  });

  await test.step('After removing songs from favourite-list on remote mic, the songs should be removed from playlist too', async () => {
    await remoteMic.remoteMicSongListPage.removeSongFromFavouriteList(songs.polish2.ID);
    await remoteMic.remoteMicSongListPage.removeSongFromFavouriteList(songs.french.ID);
    await remoteMic.remoteMicSongListPage.expectFavouriteListToContainNumberOfSongs('2');
    await expect(await pages.songListPage.getSongElement(songs.polish2.ID)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.french.ID)).not.toBeVisible();
  });
});
