import { expect, test } from '@playwright/test';
import { RemoteMicPages } from './PageObjects/RemoteMic/initialiseRemoteMic';
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
    artist: 'French Test',
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
  const player2Name = 'Player2';
  const remoteMicsPlaylistName = 'remote-mics';

  let remoteMic: RemoteMicPages;
  let remoteMic2: RemoteMicPages;

  await test.step('Ensure that all languages are selected', async () => {
    await page.goto('/');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureAllLanguagesAreSelected();
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Connect Player1 remote mic by QR code', async () => {
    await expect(pages.songListPage.getPlaylistElement(remoteMicsPlaylistName)).not.toBeVisible();
    await pages.songListPage.toolbar.quickConnectPhone();
    remoteMic = await openAndConnectRemoteMicWithCode(page, browser, playerName);
    await pages.songListPage.toolbar.closeQuickConnectPhone();
  });

  await test.step('After first device connecting, the empty remoteMics playlist should appear on desktop app', async () => {
    await remoteMic.remoteMicMainPage.expectPlayerToBeConnected();
    await expect(pages.songListPage.getPlaylistElement(remoteMicsPlaylistName)).toBeVisible();
    await pages.songListPage.goToPlaylist(remoteMicsPlaylistName);
    await pages.songListPage.expectPlaylistToBeSelected(remoteMicsPlaylistName);
    await expect(pages.songListPage.remoteMicPlaylistTip).toBeVisible();
    await expect(pages.songListPage.emptyPlaylistAlert).toBeVisible();
  });

  await test.step('After adding songs to Player1`s favourites, the songs should also appear in the remoteMics playlist', async () => {
    await remoteMic.remoteMicMainPage.remoteTabBar.goToSongList();
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songs.english1.ID);
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songs.polish2.ID);
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songs.spanish.ID);
    await remoteMic.remoteMicSongListPage.clickToExpandSongsGroup(songs.french.artist);
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

  await test.step('After removing songs from favourites, the songs should be removed from remoteMics playlist too', async () => {
    await remoteMic.remoteMicSongListPage.removeSongFromFavouriteList(songs.polish2.ID);
    await remoteMic.remoteMicSongListPage.removeSongFromFavouriteList(songs.french.ID);
    await remoteMic.remoteMicSongListPage.expectFavouriteListToContainNumberOfSongs('2');
    await expect(await pages.songListPage.getSongElement(songs.polish2.ID)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.french.ID)).not.toBeVisible();
  });

  await test.step('Connect Player2 remote mic by QR code', async () => {
    await pages.songListPage.toolbar.quickConnectPhone();
    remoteMic2 = await openAndConnectRemoteMicWithCode(page, browser, player2Name);
    await pages.songListPage.toolbar.closeQuickConnectPhone();
  });

  await test.step('Add songs to Player2`s favourites - songs should be visible in remoteMics playlist, which also includes songs added via Player1', async () => {
    await remoteMic2.remoteMicMainPage.remoteTabBar.goToSongList();
    await remoteMic2.remoteMicSongListPage.clickToExpandSongsGroup(songs.french.artist);
    await remoteMic2.remoteMicSongListPage.addSongToFavouriteList(songs.french.ID);
    await remoteMic2.remoteMicSongListPage.addSongToFavouriteList(songs.engPol.ID);
    await remoteMic2.remoteMicSongListPage.goToFavouriteList();
    await remoteMic2.remoteMicSongListPage.expectFavouriteListToContainNumberOfSongs('2');
    await expect(await pages.songListPage.getSongElement(songs.french.ID)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.engPol.ID)).toBeVisible();
  });

  await test.step('Add to Player1`s favourites a song, that is already in remoteMics playlist - both players now have the same song in favourites', async () => {
    await remoteMic.remoteMicSongListPage.goToAllSongsPlaylist();
    await remoteMic.remoteMicSongListPage.clickToExpandSongsGroup(songs.french.artist);
    await remoteMic.remoteMicSongListPage.addSongToFavouriteList(songs.french.ID);
    await remoteMic.remoteMicSongListPage.goToFavouriteList();
    await remoteMic.remoteMicSongListPage.expectFavouriteListToContainNumberOfSongs('3');
    await remoteMic.remoteMicSongListPage.expectSongToBeVisible(songs.french.ID);
    await remoteMic2.remoteMicSongListPage.expectSongToBeVisible(songs.french.ID);
  });

  await test.step('After removes that song from Player1`s favourites, it should still be visible in remoteMics playlist', async () => {
    await remoteMic.remoteMicSongListPage.removeSongFromFavouriteList(songs.french.ID);
    await expect(await pages.songListPage.getSongElement(songs.french.ID)).toBeVisible();
  });

  await test.step('Once the device is disconnected, its favourite songs should disappear from remoteMic playlist', async () => {
    await remoteMic._page.reload();
    await remoteMic._page.close();
    await expect(await pages.songListPage.getSongElement(songs.english1.ID)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.spanish.ID)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.engPol.ID)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.french.ID)).toBeVisible();
  });

  await test.step('When last player is disconnected, the remoteMics playlist should no longer be visible', async () => {
    await remoteMic2._page.reload();
    await expect(pages.songListPage.getPlaylistElement(remoteMicsPlaylistName)).not.toBeVisible();
  });

  await test.step('After reconnecting device, its favourite songs should appear in the remoteMics playlist', async () => {
    await remoteMic2.remoteMicMainPage.connect();
    await expect(pages.songListPage.getPlaylistElement(remoteMicsPlaylistName)).toBeVisible();
    await pages.songListPage.goToPlaylist(remoteMicsPlaylistName);
    await expect(pages.songListPage.emptyPlaylistAlert).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.engPol.ID)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.french.ID)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.english1.ID)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.spanish.ID)).not.toBeVisible();
  });
});
