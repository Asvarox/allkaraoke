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

const playlists = {
  _halloween: 'Halloween',
  _xmas: 'Christmas',
  eurovision: 'Eurovision',
  duets: 'Duets',
  new: 'New',
  all: 'All',
} as const;

const languages = {
  polish: 'Polish',
  english: 'English',
  french: 'French',
} as const;

const songs = {
  _halloween: 'e2e-croissant-french-1994',
  xmas: 'e2e-christmas-english-1995',
  eurovision: 'e2e-new-english-1995',
  last: 'zzz-last-polish-1994',
  english: {
    modern: 'e2e-single-english-1995',
    new: 'e2e-new-english-1995',
  },
  polish: {
    pol: 'e2e-skip-intro-polish',
    eng: 'e2e-english-polish-1994',
    old: {
      duet: 'e2e-multitrack-polish-1994',
      duet_Title: 'multitrack',
    },
  },
} as const;

test.skip('Filters - PlayLists', async ({ page }) => {
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
    await pages.songLanguagesPage.ensureLanguageToBeSelected(languages.polish);
    await pages.songLanguagesPage.ensureLanguageToBeSelected(languages.english);
  });

  await test.step('Check if songs are visible in all songs', async () => {
    await pages.songLanguagesPage.continueAndGoToSongList();
    await expect(await pages.songListPage.getSongElement(songs.english.modern, false)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).toBeVisible();
    await pages.songListPage.ensureSongToBeSelected(songs.polish.pol);
  });

  await test.step('Going to polish-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(languages.polish);
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish.eng)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.english.modern)).not.toBeVisible();
  });

  await test.step('Going to english-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(languages.english);
    await expect(await pages.songListPage.getSongElement(songs.english.modern)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish.eng)).toBeVisible();
  });

  await test.step('Going to duets-playlist, and check songs and duet icon visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(playlists.duets);
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).toBeVisible();
    await expect(await pages.songListPage.getDuetSongIcon(songs.polish.old.duet)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.english.modern)).not.toBeVisible();
  });

  await test.step('Going to new-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(playlists.new);
    await expect(await pages.songListPage.getSongElement(songs.english.new)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).not.toBeVisible();
  });

  await test.step('Going to all-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(playlists.all);
    await expect(await pages.songListPage.getSongElement(songs.english.modern)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.xmas)).toBeVisible();
  });

  await test.step('Leave the playlists and check songs visibility', async () => {
    await page.keyboard.press('ArrowRight');
    await pages.songListPage.goToPlaylist(languages.polish);
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish.eng)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.english.modern)).not.toBeVisible();
  });
});

test('Filters - PlayLists (Eurovision)', async ({ page }) => {
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
    await pages.songLanguagesPage.expectLanguageToBeSelected(languages.polish);
    await pages.songLanguagesPage.expectLanguageToBeSelected(languages.english);
    await pages.songLanguagesPage.ensureLanguageToBeSelected(languages.french);
  });

  await test.step('Check if songs are visible in all songs', async () => {
    await pages.songLanguagesPage.continueAndGoToSongList();
    await expect(await pages.songListPage.getSongElement(songs.english.modern)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.xmas)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).toBeVisible();
    await pages.songListPage.ensureSongToBeSelected(songs.polish.pol);
  });

  await test.step('Going to Eurovision-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(playlists.eurovision);
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish.eng)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.eurovision)).toBeVisible();
  });

  await test.step('Going to polish-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(languages.polish);
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish.eng)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.english.modern)).not.toBeVisible();
  });

  await test.step('Going to english-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(languages.english);
    await expect(await pages.songListPage.getSongElement(songs.english.modern)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish.eng)).toBeVisible();
  });

  await test.step('Going to duets-playlist, and check songs and duet icon visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(playlists.duets);
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).toBeVisible();
    await expect(await pages.songListPage.getDuetSongIcon(songs.polish.old.duet)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.english.modern)).not.toBeVisible();
  });

  await test.step('Going to new-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(playlists.new);
    await expect(await pages.songListPage.getSongElement(songs.english.new)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).not.toBeVisible();
  });

  await test.step('Going to all-playlist and check songs visibility', async () => {
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await pages.songListPage.expectPlaylistToBeSelected(playlists.all);
    await expect(await pages.songListPage.getSongElement(songs.english.modern)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.eurovision)).toBeVisible();
  });

  await test.step('Leave the playlists and check songs visibility', async () => {
    await page.keyboard.press('ArrowRight');
    await pages.songListPage.goToPlaylist(languages.polish);
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish.eng)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.english.modern)).not.toBeVisible();
  });
});

test('Filters - Quick Search', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.mainMenuPage.goToSingSong();

  await test.step('Exclusion polish language - polish songs should be invisible', async () => {
    await pages.songLanguagesPage.ensureLanguageToBeUnselected(languages.polish);
    await pages.songLanguagesPage.continueAndGoToSongList();
    await expect(await pages.songListPage.getSongElement(songs.english.modern)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).not.toBeVisible();
  });

  await test.step('Quick search [in All-playlist] to find polish song, even if language is excluded', async () => {
    await page.keyboard.type(songs.polish.old.duet_Title);
    await expect(pages.songListPage.searchInput).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.english.modern)).not.toBeVisible();
    await pages.songListPage.expectSelectedSongToBe(songs.polish.old.duet);
  });

  await test.step('Polish song is invisible again after clearing search', async () => {
    await page.keyboard.press('Backspace');
    await expect(pages.songListPage.searchInput).toBeFocused();
    await pages.songListPage.searchInput.clear();
    // Validate that na additional backspace doesn't close the song list
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await expect(pages.songListPage.searchInput).not.toBeVisible();

    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.english.modern)).toBeVisible();
  });

  await test.step('Search should be scoped to a playlist', async () => {
    await pages.songListPage.goToPlaylist(languages.english);
    await page.keyboard.type(songs.polish.old.duet_Title);
    await expect(pages.songListPage.searchInput).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.polish.old.duet)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(songs.english.modern)).not.toBeVisible();
  });

  await test.step('Switching to another playlist clears the search, search window is not visible', async () => {
    await pages.songListPage.goToPlaylist(playlists.all);
    await expect(pages.songListPage.searchInput).not.toBeVisible();
  });

  await test.step('Search button should open and focus the search', async () => {
    await pages.songListPage.searchButton.click();
    await expect(pages.songListPage.searchInput).toBeFocused();
  });

  await test.step('Search button should close search when clicked with search opened', async () => {
    // need to fix that - clicking the button doesn't close the search when it's empty
    await page.keyboard.type(songs.polish.old.duet_Title);
    await pages.songListPage.searchButton.click();
    await expect(pages.songListPage.searchInput).not.toBeVisible();
  });
});

test('Song List - Random song', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Random song is selected on song list open', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureLanguageToBeSelected(languages.polish);
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.songListPage.expectSelectedSongToBe(songs.last);
  });

  await test.step('Random song is selected on shortcut', async () => {
    await pages.songListPage.ensureSongToBeSelected(songs.polish.old.duet);
    await pages.songListPage.expectSelectedSongNotToBe(songs.last);
    await page.keyboard.press('Shift+R');
    await pages.songListPage.expectSelectedSongToBe(songs.last);
  });

  await test.step('Random song is selected on random song button click', async () => {
    await page.waitForTimeout(500); // trying to focus song mid-scroll can make it not exist in the virtual list
    await pages.songListPage.ensureSongToBeSelected(songs.polish.old.duet);
    await pages.songListPage.expectSelectedSongNotToBe(songs.last);
    await pages.songListPage.pickRandomButton.click();
    // Second random selects next-to-last song as there's mechanism that prevents selecting the same song twice
    await pages.songListPage.expectSelectedSongToBe(songs.english.modern);
  });
});
