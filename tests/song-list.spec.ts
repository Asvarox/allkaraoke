import { expect, test } from '@playwright/test';
import { initTestMode, mockRandom, mockSongs } from './helpers';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockRandom({ page, context }, 1);
  await mockSongs({ page, context });
});
const polishPlaylist = 'Polish';
const englishPlaylist = 'English';
const duetsPlaylist = 'Duets';
const newPlaylist = 'New';
const allPlaylist = 'All';

const xmasPlaylist = 'Christmas';
const xmasSong = 'e2e-christmas-english-1995';

const halloweenPlaylist = 'Halloween';
const halloweenSong = 'e2e-croissant-french-1994';

const engModSong = 'e2e-single-english-1995';
const polOldDuetSong = 'e2e-multitrack-polish-1994';
const polEngSong = 'e2e-english-polish-1994';
const polSong = 'e2e-skip-intro-polish';
const engNewSong = 'e2e-new-english-1995';
const lastSong = 'zzz-last-polish-1994';

const polishSongTitle = 'multitrack';
const polishLang = 'Polish';
const englishLang = 'English';
const frenchLang = 'French';

test('Filters - PlayLists', async ({ page }) => {
  // Make sure the new song mock is actually considered new
  const fakeNow = new Date('2023-01-16T10:35:39.918Z').valueOf();

  // Update the Date accordingly in your test pages
  await page.addInitScript(`{
      // Extend Date constructor to default to fakeNow
      Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            super(${fakeNow});
          } else {
            super(...args);
          }
        }
      }
      // Override Date.now() to start from fakeNow
      const __DateNowOffset = ${fakeNow} - Date.now();
      const __DateNow = Date.now;
      Date.now = () => __DateNow() + __DateNowOffset;
    }`);

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.mainMenuPage.goToSingSong();

  await test.step('Make sure proper song languages are selected', async () => {
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(polishLang);
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(englishLang);
  });

  await test.step('Check if songs are visible in all songs', async () => {
    await pages.songLanguagesPage.continueAndGoToSongList();
    await expect(await pages.songListPage.getSongElement(engModSong, false)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).toBeVisible();
    await pages.songListPage.focusSong(polSong);
  });

  await test.step('Going to polish-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(polishPlaylist);
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(polEngSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(engModSong)).not.toBeVisible();
  });

  await test.step('Going to english-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(englishPlaylist);
    await expect(await pages.songListPage.getSongElement(engModSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(polEngSong)).toBeVisible();
  });

  await test.step('Going to duets-playlist, and check songs and duet icon visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(duetsPlaylist);
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).toBeVisible();
    await expect(await pages.songListPage.getDuetSongIcon(polOldDuetSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(engModSong)).not.toBeVisible();
  });

  await test.step('Going to new-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(newPlaylist);
    await expect(await pages.songListPage.getSongElement(engNewSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).not.toBeVisible();
  });

  await test.step('Going to all-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(allPlaylist);
    await expect(await pages.songListPage.getSongElement(engModSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(xmasSong)).toBeVisible();
  });

  await test.step('Leave the playlists and check songs visibility', async () => {
    await page.keyboard.press('ArrowRight');
    await pages.songListPage.goToPlaylist(polishPlaylist);
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(polEngSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(engModSong)).not.toBeVisible();
  });
});

test.skip('Filters - PlayLists (Christmas)', async ({ page }) => {
  // Make sure the new song mock is actually considered new
  const fakeNow = new Date('2023-01-16T10:35:39.918Z').valueOf();

  // Update the Date accordingly in your test pages
  await page.addInitScript(`{
      // Extend Date constructor to default to fakeNow
      Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            super(${fakeNow});
          } else {
            super(...args);
          }
        }
      }
      // Override Date.now() to start from fakeNow
      const __DateNowOffset = ${fakeNow} - Date.now();
      const __DateNow = Date.now;
      Date.now = () => __DateNow() + __DateNowOffset;
    }`);

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.mainMenuPage.goToSingSong();

  await test.step('Make sure proper song languages are selected', async () => {
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(polishLang);
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(englishLang);
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(frenchLang);
  });

  await test.step('Check if songs are visible in all songs', async () => {
    await pages.songLanguagesPage.continueAndGoToSongList();
    await expect(await pages.songListPage.getSongElement(engModSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(xmasSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).toBeVisible();
    await pages.songListPage.focusSong(polSong);
  });

  await test.step('Going to Christmas-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(xmasPlaylist);
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(polEngSong)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(xmasSong)).toBeVisible();
  });

  await test.step('Going to polish-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(polishPlaylist);
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(polEngSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(engModSong)).not.toBeVisible();
  });

  await test.step('Going to english-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(englishPlaylist);
    await expect(await pages.songListPage.getSongElement(engModSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(polEngSong)).toBeVisible();
  });

  await test.step('Going to duets-playlist, and check songs and duet icon visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(duetsPlaylist);
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).toBeVisible();
    await expect(await pages.songListPage.getDuetSongIcon(polOldDuetSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(engModSong)).not.toBeVisible();
  });

  await test.step('Going to new-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(newPlaylist);
    await expect(await pages.songListPage.getSongElement(engNewSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).not.toBeVisible();
  });

  await test.step('Going to all-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(allPlaylist);
    await expect(await pages.songListPage.getSongElement(engModSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(xmasSong)).toBeVisible();
  });

  await test.step('Leave the playlists and check songs visibility', async () => {
    await page.keyboard.press('ArrowRight');
    await pages.songListPage.goToPlaylist(polishPlaylist);
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(polEngSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(engModSong)).not.toBeVisible();
  });
});

test('Filters - Quick Search', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.mainMenuPage.goToSingSong();

  await test.step('Exclusion polish language - polish songs should be invisible', async () => {
    await pages.songLanguagesPage.unselectLanguage(polishLang);
    await pages.songLanguagesPage.continueAndGoToSongList();
    await expect(await pages.songListPage.getSongElement(engModSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).not.toBeVisible();
  });

  await test.step('Quick search [in All-playlist] to find polish song, even if language is excluded', async () => {
    await page.keyboard.type(polishSongTitle);
    await expect(pages.songListPage.searchInput).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(engModSong)).not.toBeVisible();
    await pages.songListPage.expectSelectedSongToBe(polOldDuetSong);
  });

  await test.step('Polish song is invisible again after clearing search', async () => {
    await page.keyboard.press('Backspace');
    await expect(pages.songListPage.searchInput).toBeFocused();
    await pages.songListPage.searchInput.clear();
    // Validate that na additional backspace doesn't close the song list
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await expect(pages.songListPage.searchInput).not.toBeVisible();

    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(engModSong)).toBeVisible();
  });

  await test.step('Search should be scoped to a playlist', async () => {
    await pages.songListPage.goToPlaylist(englishPlaylist);
    await page.keyboard.type(polishSongTitle);
    await expect(pages.songListPage.searchInput).toBeVisible();
    await expect(await pages.songListPage.getSongElement(polOldDuetSong)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(engModSong)).not.toBeVisible();
  });

  await test.step('Switching to another playlist clears the search, search window is not visible', async () => {
    await pages.songListPage.goToPlaylist(allPlaylist);
    await expect(pages.songListPage.searchInput).not.toBeVisible();
  });

  await test.step('Search button should open and focus the search', async () => {
    await pages.songListPage.searchButton.click();
    await expect(pages.songListPage.searchInput).toBeFocused();
  });

  await test.step('Search button should close search when clicked with search opened', async () => {
    // need to fix that - clicking the button doesn't close the search when it's empty
    await page.keyboard.type(polishSongTitle);
    await pages.songListPage.searchButton.click();
    await expect(pages.songListPage.searchInput).not.toBeVisible();
  });
});

test('Song List - Random song', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Random song is selected on song list open', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(polishLang);
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.songListPage.expectSelectedSongToBe(lastSong);
  });

  await test.step('Random song is selected on shortcut', async () => {
    await pages.songListPage.focusSong(polOldDuetSong);
    await pages.songListPage.expectSelectedSongNotToBe(lastSong);
    await page.keyboard.press('Shift+R');
    await pages.songListPage.expectSelectedSongToBe(lastSong);
  });

  await test.step('Random song is selected on random song button click', async () => {
    await page.waitForTimeout(500); // trying to focus song mid-scroll can make it not exist in the virtual list
    await pages.songListPage.focusSong(polOldDuetSong);
    await pages.songListPage.expectSelectedSongNotToBe(lastSong);
    await pages.songListPage.pickRandomButton.click();
    // Second random selects next-to-last song as there's mechanism that prevents selecting the same song twice
    await pages.songListPage.expectSelectedSongToBe(engModSong);
  });
});
