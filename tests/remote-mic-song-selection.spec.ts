import { expect, test } from '@playwright/test';

import { initTestMode, mockSongs } from './helpers';
import initialise from './page-objects/initialise';
import { openAndConnectRemoteMicWithCode } from './steps/open-and-connect-remote-mic';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

// Service worker caches index.json which breaks playwright's request intercept (mocking of song list)
test.use({ serviceWorkers: 'block' });

const player = { name: 'E2E Test Blue' } as const;

// The mocked song list, with the default language selection, groups by first letter of the artist
// into exactly these buckets — see tests/fixtures/songs.
const ALL_PLAYLIST_GROUPS = ['0-9', 'C', 'P', 'T', 'Z'];

// How long the screen ignores Backspace after a search is cleared, plus a margin.
const SEARCH_BACK_BLOCK_MS = 2_500;

test('Remote mic mirrors and drives the song selection playlists and groups', async ({
  browser,
  page,
  browserName,
}) => {
  // Same reason as remote-mics-sing-a-song.spec.ts: the two-page remote-mic setup fails super often
  // on FF long before reaching anything this test is about.
  test.fixme(browserName === 'firefox', 'Test fails super often on FF');
  test.slow();

  const remoteMic = await test.step('Connect a phone and let it open the song browser', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectSmartphones();

    const remoteMic = await openAndConnectRemoteMicWithCode(page, browser, player.name);
    await pages.smartphonesConnectionPage.navigateToSaveButtonWithKeyboard(remoteMic._page);
    await remoteMic.remoteMicMainPage.pressEnterOnRemoteMic();
    await expect(pages.mainMenuPage.singSongButton).toBeVisible();

    // Both screens mirror their controls, so tap them directly rather than arrow-navigating.
    await remoteMic.remoteMicMainPage.mirroredControl('sing-a-song').click();
    await remoteMic.remoteMicMainPage.mirroredControl('close-exclude-languages').click();

    return remoteMic;
  });

  await test.step('The phone shows the screen`s toolbar and group row', async () => {
    await remoteMic.remoteMicMainPage.expectKeyboardModeToBe('song-selection');
    await remoteMic.remoteMicMainPage.expectSelectedPlaylistToBe('Selection');

    // Search starts collapsed to an icon, the way the screen shows it at its smallest breakpoint.
    await expect(remoteMic.remoteMicMainPage.searchSongButton).toBeVisible();
    await expect(remoteMic.remoteMicMainPage.searchSongInput).not.toBeVisible();
  });

  await test.step('Playlists can be switched from the phone', async () => {
    await remoteMic.remoteMicMainPage.selectPlaylist('Duets');
    await pages.songListPage.expectPlaylistToBeSelected('Duets');
    await remoteMic.remoteMicMainPage.expectSelectedPlaylistToBe('Duets');

    await remoteMic.remoteMicMainPage.selectPlaylist('All');
    await pages.songListPage.expectPlaylistToBeSelected('All');
    await remoteMic.remoteMicMainPage.expectSelectedPlaylistToBe('All');
  });

  await test.step('The phone offers the same groups as the screen', async () => {
    await pages.songListPage.songGroups.expectGroupsToBe(ALL_PLAYLIST_GROUPS);
    await remoteMic.remoteMicMainPage.songGroups.expectGroupsToBe(ALL_PLAYLIST_GROUPS);
  });

  await test.step('Tapping a group on the phone scrolls the host list to it', async () => {
    await remoteMic.remoteMicMainPage.songGroups.goToGroup('Z');

    await pages.songListPage.expectGroupToBeInViewport('Z');
    await pages.songListPage.expectSelectedSongToBe('zzz-last-polish-1994');

    await pages.songListPage.songGroups.expectGroupToBeVisibleInTheSongList('Z');
    await remoteMic.remoteMicMainPage.songGroups.expectGroupToBeVisibleInTheSongList('Z');
  });

  await test.step('The group holding the selected song stays marked once the list scrolls off it', async () => {
    // Scroll without touching the selection, so the selected song's group ('Z') leaves the viewport
    // and falls back to the subtler "holds the selection" mark instead of the in-view one.
    await pages.songListPage.scrollSongListToTop();

    await pages.songListPage.songGroups.expectGroupToBeVisibleInTheSongList('0-9');
    await pages.songListPage.songGroups.expectGroupToHoldTheSelectedSong('Z');

    await remoteMic.remoteMicMainPage.songGroups.expectGroupToBeVisibleInTheSongList('0-9');
    await remoteMic.remoteMicMainPage.songGroups.expectGroupToHoldTheSelectedSong('Z');
    await remoteMic.remoteMicMainPage.songGroups.expectGroupNotToHoldTheSelectedSong('0-9');
  });

  await test.step('The collapsed search still filters the host list, and closing it clears the filter', async () => {
    await remoteMic.remoteMicMainPage.searchTheSong('Skip Intro song');

    await expect(await pages.songListPage.getSongElement('e2e-skip-intro-polish')).toBeVisible();
    // A search replaces the letter groups with a results group on the screen — and so on the phone.
    await remoteMic.remoteMicMainPage.songGroups.expectGroupToBeOffered('Search results');

    await remoteMic.remoteMicMainPage.closeTheSongSearch();

    await expect(remoteMic.remoteMicMainPage.searchSongButton).toBeVisible();
    await remoteMic.remoteMicMainPage.songGroups.expectGroupsToBe(ALL_PLAYLIST_GROUPS);
  });

  await test.step('The mirror is cleared when the host leaves song selection', async () => {
    // Clearing a search briefly blocks Backspace on the screen, so the same keypress that cleared
    // the search can't also leave it (see `blockBack` in useSongSelectionKeyboardNavigation).
    await page.waitForTimeout(SEARCH_BACK_BLOCK_MS);
    await pages.songListPage.goBackToMainMenu();

    await expect(pages.mainMenuPage.singSongButton).toBeVisible();
    await expect(remoteMic.remoteMicMainPage.playlistPickerTrigger).not.toBeVisible();
  });
});
