import { expect, test } from '@playwright/test';
import { initTestMode, mockRandom, mockSongs } from './helpers';
import navigateWithKeyboard from './steps/navigateWithKeyboard';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockRandom({ page, context }, 1);
  await mockSongs({ page, context });
});

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
  await page.getByTestId('skip').click();

  await page.getByTestId('sing-a-song').click();
  await expect(page.getByTestId('lang-Polish')).toBeVisible();
  await page.getByTestId('close-exclude-languages').click();

  await expect(page.getByTestId('song-e2e-single-english-1995')).toBeVisible();
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).toBeVisible();

  await navigateWithKeyboard(page, 'song-e2e-skip-intro-polish');

  // Go to playlists
  await page.keyboard.press('ArrowLeft');

  await page.keyboard.press('ArrowDown'); // Polish (first, as it has most songs)
  await expect(page.getByTestId('playlist-Polish')).toHaveAttribute('data-focused', 'true');
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).toBeVisible();
  await expect(page.getByTestId('song-e2e-english-polish-1994')).toBeVisible();
  await expect(page.getByTestId('song-e2e-single-english-1995')).not.toBeVisible();

  await page.keyboard.press('ArrowDown'); // English
  await expect(page.getByTestId('playlist-English')).toHaveAttribute('data-focused', 'true');
  await expect(page.getByTestId('song-e2e-single-english-1995')).toBeVisible();
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).not.toBeVisible();
  await expect(page.getByTestId('song-e2e-english-polish-1994')).toBeVisible();

  await page.keyboard.press('ArrowDown'); // Classics
  await expect(page.getByTestId('playlist-Classics')).toHaveAttribute('data-focused', 'true');
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).toBeVisible();
  await expect(page.getByTestId('song-e2e-single-english-1995')).not.toBeVisible();

  await page.keyboard.press('ArrowDown'); // Modern
  await expect(page.getByTestId('playlist-Modern')).toHaveAttribute('data-focused', 'true');
  await expect(page.getByTestId('song-e2e-single-english-1995')).toBeVisible();
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).not.toBeVisible();

  await page.keyboard.press('ArrowDown'); // Duets
  await expect(page.getByTestId('playlist-Duets')).toHaveAttribute('data-focused', 'true');
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).toBeVisible();
  await expect(page.getByTestId('song-e2e-single-english-1995')).not.toBeVisible();

  await page.keyboard.press('ArrowDown'); // New
  await expect(page.getByTestId('playlist-New')).toHaveAttribute('data-focused', 'true');
  await expect(page.getByTestId('song-e2e-new-english-1995')).toBeVisible();
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).not.toBeVisible();

  await page.keyboard.press('ArrowDown'); // All
  await expect(page.getByTestId('playlist-All')).toHaveAttribute('data-focused', 'true');
  await expect(page.getByTestId('song-e2e-single-english-1995')).toBeVisible();
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).toBeVisible();

  await page.keyboard.press('ArrowRight'); // Leave the playlists
  await page.getByTestId('playlist-Polish').click();
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).toBeVisible();
  await expect(page.getByTestId('song-e2e-english-polish-1994')).toBeVisible();
  await expect(page.getByTestId('song-e2e-single-english-1995')).not.toBeVisible();
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
  await page.getByTestId('skip').click();

  await page.getByTestId('sing-a-song').click();
  await expect(page.getByTestId('lang-Polish')).toBeVisible();
  await page.getByTestId('close-exclude-languages').click();

  await expect(page.getByTestId('song-e2e-single-english-1995')).toBeVisible();
  await expect(page.getByTestId('song-e2e-christmas-english-1995')).toBeVisible();
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).toBeVisible();

  await navigateWithKeyboard(page, 'song-e2e-skip-intro-polish');

  // Go to playlists
  await page.keyboard.press('ArrowLeft');

  await page.keyboard.press('ArrowDown'); // Christmas
  await expect(page.getByTestId('playlist-Christmas')).toHaveAttribute('data-focused', 'true');
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).not.toBeVisible();
  await expect(page.getByTestId('song-e2e-english-polish-1994')).not.toBeVisible();
  await expect(page.getByTestId('song-e2e-christmas-english-1995')).toBeVisible();

  await page.keyboard.press('ArrowDown'); // Polish (first, as it has most songs)
  await expect(page.getByTestId('playlist-Polish')).toHaveAttribute('data-focused', 'true');
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).toBeVisible();
  await expect(page.getByTestId('song-e2e-english-polish-1994')).toBeVisible();
  await expect(page.getByTestId('song-e2e-single-english-1995')).not.toBeVisible();

  await page.keyboard.press('ArrowDown'); // English
  await expect(page.getByTestId('playlist-English')).toHaveAttribute('data-focused', 'true');
  await expect(page.getByTestId('song-e2e-single-english-1995')).toBeVisible();
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).not.toBeVisible();
  await expect(page.getByTestId('song-e2e-english-polish-1994')).toBeVisible();

  await page.keyboard.press('ArrowDown'); // Duets
  await expect(page.getByTestId('playlist-Duets')).toHaveAttribute('data-focused', 'true');
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).toBeVisible();
  await expect(page.getByTestId('song-e2e-single-english-1995')).not.toBeVisible();

  await page.keyboard.press('ArrowDown'); // New
  await expect(page.getByTestId('playlist-New')).toHaveAttribute('data-focused', 'true');
  await expect(page.getByTestId('song-e2e-new-english-1995')).toBeVisible();
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).not.toBeVisible();

  await page.keyboard.press('ArrowDown'); // All
  await expect(page.getByTestId('playlist-All')).toHaveAttribute('data-focused', 'true');
  await expect(page.getByTestId('song-e2e-single-english-1995')).toBeVisible();
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).toBeVisible();

  await page.keyboard.press('ArrowRight'); // Leave the playlists
  await page.getByTestId('playlist-Polish').click();
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).toBeVisible();
  await expect(page.getByTestId('song-e2e-english-polish-1994')).toBeVisible();
  await expect(page.getByTestId('song-e2e-single-english-1995')).not.toBeVisible();
});

test('Filters - Quick Search', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await page.getByTestId('skip').click();

  await page.getByTestId('sing-a-song').click();

  await test.step('exclude polish songs', async () => {
    await page.getByTestId('lang-Polish').click();
    await page.getByTestId('close-exclude-languages').click();
  });

  await expect(page.getByTestId('song-e2e-single-english-1995')).toBeVisible();
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).not.toBeVisible();

  // Quick search
  await page.keyboard.type('multitrack');
  await expect(page.getByTestId('filters-search')).toBeVisible();
  await page.keyboard.press('ArrowDown');
  // finds polish song even if the language excluded
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).toBeVisible();
  await expect(page.getByTestId('song-e2e-single-english-1995')).not.toBeVisible();
  await expect(page.getByTestId('song-preview')).toHaveAttribute('data-song', 'e2e-multitrack-polish-1994');

  // Clear search
  await page.keyboard.press('Backspace');
  await expect(page.getByTestId('filters-search')).toBeFocused();
  await page.getByTestId('filters-search').clear();
  // Validate that na additional backspace doesn't close the song list
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');

  // The polish song is not visible anymore
  await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).not.toBeVisible();
  await expect(page.getByTestId('song-e2e-single-english-1995')).toBeVisible();
  await expect(page.getByTestId('filters-search')).not.toBeVisible();

  await test.step('Search should be scoped to a playlist', async () => {
    await page.getByTestId('playlist-English').click();
    await page.keyboard.type('multitrack');
    await expect(page.getByTestId('song-e2e-multitrack-polish-1994')).not.toBeVisible();
    await expect(page.getByTestId('song-e2e-single-english-1995')).not.toBeVisible();
  });

  await test.step('Switching to another playlist clears the search', async () => {
    await page.getByTestId('playlist-All').click();
    await expect(page.getByTestId('filters-search')).not.toBeVisible();
  });

  await test.step('Search button should open and focus the search', async () => {
    await page.getByTestId('search-song-button').click();
    await expect(page.getByTestId('filters-search')).toBeFocused();
  });

  await test.step('Search button should close search when clicked with search opened', async () => {
    // need to fix that - clicking the button doesn't close the search when it's empty
    // await page.getByTestId('search-song-button').click();
    // await expect(page.getByTestId('filters-search')).not.toBeVisible();
    await page.keyboard.type('multitrack');
    await page.getByTestId('search-song-button').click();
    await expect(page.getByTestId('filters-search')).not.toBeVisible();
  });
});

test('Song List - Random song', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await page.getByTestId('skip').click();

  await test.step('Random song is selected on song list open', async () => {
    await page.getByTestId('sing-a-song').click();
    await expect(page.getByTestId('lang-Polish')).toBeVisible();
    await page.getByTestId('close-exclude-languages').click();
    await expect(page.getByTestId('song-preview')).toHaveAttribute('data-song', 'zzz-last-polish-1994');
  });

  await test.step('Random song is selected on shortcut', async () => {
    await page.getByTestId('song-e2e-multitrack-polish-1994').click();
    await expect(page.getByTestId('song-preview')).not.toHaveAttribute('data-song', 'zzz-last-polish-1994');
    await page.keyboard.press('Shift+R');
    await expect(page.getByTestId('song-preview')).toHaveAttribute('data-song', 'zzz-last-polish-1994');
  });

  await test.step('Random song is selected on random song button click', async () => {
    await page.getByTestId('song-e2e-multitrack-polish-1994').click();
    await expect(page.getByTestId('song-preview')).not.toHaveAttribute('data-song', 'zzz-last-polish-1994');
    await page.getByTestId('random-song-button').click();
    // Second random selects next-to-last song as there's mechanism that prevents selecting the same song twice
    await expect(page.getByTestId('song-preview')).toHaveAttribute('data-song', 'e2e-single-english-1995');
  });
});
