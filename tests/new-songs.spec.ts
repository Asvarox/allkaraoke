import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const LAST_VISIT_NO_NEW_SONGS = new Date('2023-01-16T10:35:39.918Z').getTime();
const LAST_VISIT_NEW_SONG = new Date('2023-01-14T10:35:39.918Z').getTime();
const song = 'e2e-new-english-1995';
const newGroupSong = 'e2e-new-english-1995-new-group';
const playlistName = 'English';

test('New songs - displays new song twice by default and doesnt show it in filters', async ({ page }) => {
  await page.addInitScript(
    ([timestamp]) => {
      window.localStorage.setItem('posthog-user-id', 'posthog-user-id'); // So it's not a "first visit"
      window.localStorage.setItem('LAST_VISIT_KEY', String(timestamp));
    },
    [LAST_VISIT_NEW_SONG],
  );

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await page.waitForTimeout(100);
  await pages.inputSelectionPage.skipToMainMenu();
  await page.waitForTimeout(500);
  await pages.mainMenuPage.goToSingSong();
  await pages.songLanguagesPage.continueAndGoToSongList();
  await expect(pages.songListPage.getSongElement(newGroupSong)).toBeVisible();
  await page.waitForTimeout(5000);
  // await page.pause();
  await expect(pages.songListPage.getSongElement(song)).toBeVisible();

  // Should still show new group when playlists are used
  await pages.songListPage.goToPlaylist(playlistName);
  await expect(pages.songListPage.getSongElement(song)).toBeVisible();
  await expect(pages.songListPage.getSongElement(newGroupSong)).toBeVisible();

  await page.keyboard.type('playwright');
  await expect(pages.songListPage.getSongElement(song)).toBeVisible();
  await expect(pages.songListPage.getSongElement(newGroupSong)).not.toBeVisible();
});

test('New songs - doesnt display new songs if the visit is after', async ({ page }) => {
  await page.addInitScript(
    ([timestamp]) => {
      window.localStorage.setItem('posthog-user-id', 'posthog-user-id'); // So it's not a "first visit"
      window.localStorage.setItem('LAST_VISIT_KEY', String(timestamp));
    },
    [LAST_VISIT_NO_NEW_SONGS],
  );

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.skipToMainMenu();
  await pages.mainMenuPage.goToSingSong();
  await pages.songLanguagesPage.continueAndGoToSongList();
  await expect(pages.songListPage.getSongElement(song)).toBeVisible();
  await expect(pages.songListPage.getSongElement(newGroupSong)).not.toBeVisible();
});

test('New songs - doesnt display new songs on first visit', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.skipToMainMenu();
  await pages.mainMenuPage.goToSingSong();
  await pages.songLanguagesPage.continueAndGoToSongList();
  await expect(pages.songListPage.getSongElement(song)).toBeVisible();
  await expect(pages.songListPage.getSongElement(newGroupSong)).not.toBeVisible();
});
