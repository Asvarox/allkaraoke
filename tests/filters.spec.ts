import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import navigateWithKeyboard from './steps/navigateWithKeyboard';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

test('Filters - PlayLists', async ({ page }) => {
    await page.goto('/?e2e-test');
    await page.getByTestId('skip').click({ force: true });

    await page.getByTestId('sing-a-song').click({ force: true });

    await expect(page.getByTestId('song-e2e-test.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-test-multitrack.json')).toBeVisible();

    await navigateWithKeyboard(page, 'song-e2e-skip-intro-song.json');

    // Go to playlists
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');

    await page.keyboard.press('ArrowDown'); // Polish
    await expect(page.getByTestId('song-e2e-test.json')).not.toBeVisible();
    await expect(page.getByTestId('song-e2e-test-multitrack.json')).toBeVisible();

    await page.keyboard.press('ArrowDown'); // English
    await expect(page.getByTestId('song-e2e-test.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-test-multitrack.json')).not.toBeVisible();

    await page.keyboard.press('ArrowDown'); // Classics
    await expect(page.getByTestId('song-e2e-test.json')).not.toBeVisible();
    await expect(page.getByTestId('song-e2e-test-multitrack.json')).toBeVisible();

    await page.keyboard.press('ArrowDown'); // Modern
    await expect(page.getByTestId('song-e2e-test.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-test-multitrack.json')).not.toBeVisible();

    await page.keyboard.press('ArrowDown'); // Duet
    await expect(page.getByTestId('song-e2e-test.json')).not.toBeVisible();
    await expect(page.getByTestId('song-e2e-test-multitrack.json')).toBeVisible();

    await page.keyboard.press('ArrowDown'); // All
    await expect(page.getByTestId('song-e2e-test.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-test-multitrack.json')).toBeVisible();
});

test('Filters - Quick Search', async ({ page }) => {
    await page.goto('/?e2e-test');
    await page.getByTestId('skip').click({ force: true });

    await page.getByTestId('sing-a-song').click({ force: true });

    await expect(page.getByTestId('song-e2e-test.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-test-multitrack.json')).toBeVisible();

    // Quick search
    await page.keyboard.type('multitrack');
    await expect(page.getByTestId('filters-search')).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByTestId('song-e2e-test-multitrack.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-test.json')).not.toBeVisible();
    await expect(page.getByTestId('song-preview')).toHaveAttribute('data-song', 'e2e-test-multitrack.json');

    // Clear search
    await page.keyboard.press('Backspace');
    await expect(page.getByTestId('filters-search')).toBeFocused();
    for (let i = 0; i < 'multitrack'.length; i++) await page.keyboard.press('Backspace');

    await expect(page.getByTestId('song-e2e-test-multitrack.json')).toBeVisible();
    await expect(page.getByTestId('song-e2e-test.json')).toBeVisible();
    await expect(page.getByTestId('filters-search')).not.toBeVisible();
});
