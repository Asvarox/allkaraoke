import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import navigateWithKeyboard from './steps/navigateWithKeyboard';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context }, 1);
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
    await page.getByTestId('skip').click();

    await page.getByTestId('sing-a-song').click();
    await expect(page.getByTestId('lang-Polish')).toBeVisible();
    await page.getByTestId('close-exclude-languages').click();

    await expect(page.getByTestId('song-e2e-single-english-1995.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-multitrack-polish-1994.json')).toBeVisible();

    await navigateWithKeyboard(page, 'song-e2e-skip-intro-polish.json');

    // Go to playlists
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');

    await page.keyboard.press('ArrowDown'); // English
    await expect(page.getByTestId('song-e2e-single-english-1995.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-multitrack-polish-1994.json')).not.toBeVisible();
    await expect(page.getByTestId('song-e2e-english-polish-1994.json')).toBeVisible();

    await page.keyboard.press('ArrowDown'); // Polish
    await expect(page.getByTestId('song-e2e-multitrack-polish-1994.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-english-polish-1994.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-single-english-1995.json')).not.toBeVisible();

    await page.keyboard.press('ArrowDown'); // Classics
    await expect(page.getByTestId('song-e2e-multitrack-polish-1994.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-single-english-1995.json')).not.toBeVisible();

    await page.keyboard.press('ArrowDown'); // Modern
    await expect(page.getByTestId('song-e2e-single-english-1995.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-multitrack-polish-1994.json')).not.toBeVisible();

    await page.keyboard.press('ArrowDown'); // Duet
    await expect(page.getByTestId('song-e2e-multitrack-polish-1994.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-single-english-1995.json')).not.toBeVisible();

    await page.keyboard.press('ArrowDown'); // New
    await expect(page.getByTestId('song-e2e-new-english-1995.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-multitrack-polish-1994.json')).not.toBeVisible();

    await page.keyboard.press('ArrowDown'); // All
    await expect(page.getByTestId('song-e2e-single-english-1995.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-multitrack-polish-1994.json')).toBeVisible();
});

test('Filters - Quick Search', async ({ page }) => {
    await page.goto('/?e2e-test');
    await page.getByTestId('skip').click();

    await page.getByTestId('sing-a-song').click();

    await test.step('exclude polish songs', async () => {
        await page.getByTestId('lang-Polish').click();
        await page.getByTestId('close-exclude-languages').click();
    });

    await expect(page.getByTestId('song-e2e-single-english-1995.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-multitrack-polish-1994.json')).not.toBeVisible();

    // Quick search
    await page.keyboard.type('multitrack');
    await expect(page.getByTestId('filters-search')).toBeVisible();
    await page.keyboard.press('ArrowDown');
    // finds polish song even if the language excluded
    await expect(page.getByTestId('song-e2e-multitrack-polish-1994.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-single-english-1995.json')).not.toBeVisible();
    await expect(page.getByTestId('song-preview')).toHaveAttribute('data-song', 'e2e-multitrack-polish-1994.json');

    // Clear search
    await page.keyboard.press('Backspace');
    await expect(page.getByTestId('filters-search')).toBeFocused();
    await page.getByTestId('filters-search').clear();

    // The polish song is not visible anymore
    await expect(page.getByTestId('song-e2e-multitrack-polish-1994.json')).not.toBeVisible();
    await expect(page.getByTestId('song-e2e-single-english-1995.json')).toBeVisible();
    await expect(page.getByTestId('filters-search')).not.toBeVisible();
});

test('Song List - Random song', async ({ page }) => {
    await page.goto('/?e2e-test');
    await page.getByTestId('skip').click();

    await test.step('Random song is selected on song list open', async () => {
        await page.getByTestId('sing-a-song').click();
        await expect(page.getByTestId('lang-Polish')).toBeVisible();
        await page.getByTestId('close-exclude-languages').click();
        await expect(page.getByTestId('song-preview')).toHaveAttribute('data-song', 'zzz-last-polish-1994.json');
    });

    await test.step('Random song is selected on shortcut', async () => {
        await page.getByTestId('song-e2e-multitrack-polish-1994.json').click();
        await expect(page.getByTestId('song-preview')).not.toHaveAttribute('data-song', 'zzz-last-polish-1994.json');
        await page.keyboard.press('Shift+R');
        await expect(page.getByTestId('song-preview')).toHaveAttribute('data-song', 'zzz-last-polish-1994.json');
    });
});
