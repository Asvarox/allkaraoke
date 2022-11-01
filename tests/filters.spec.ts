import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

test('Filters - PlayLists', async ({ page }) => {
    await page.goto('/?e2e-test');

    await page.locator('[data-test="sing-a-song"]').click({ force: true });

    await expect(page.locator('[data-test="song-e2e-test.json"]')).toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();

    // Go to playlists
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');

    await page.keyboard.press('ArrowDown'); // Polish
    await expect(page.locator('[data-test="song-e2e-test.json"]')).not.toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();

    await page.keyboard.press('ArrowDown'); // English
    await expect(page.locator('[data-test="song-e2e-test.json"]')).toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).not.toBeVisible();

    await page.keyboard.press('ArrowDown'); // Classics
    await expect(page.locator('[data-test="song-e2e-test.json"]')).not.toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();

    await page.keyboard.press('ArrowDown'); // Modern
    await expect(page.locator('[data-test="song-e2e-test.json"]')).toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).not.toBeVisible();

    await page.keyboard.press('ArrowDown'); // Duet
    await expect(page.locator('[data-test="song-e2e-test.json"]')).not.toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();

    await page.keyboard.press('ArrowDown'); // All
    await expect(page.locator('[data-test="song-e2e-test.json"]')).toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();
});

test('Filters - Quick Search', async ({ page }) => {
    await page.goto('/?e2e-test');

    await page.locator('[data-test="sing-a-song"]').click({ force: true });

    await expect(page.locator('[data-test="song-e2e-test.json"]')).toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();

    // Quick search
    await page.keyboard.type('multitrack');
    await expect(page.locator('[data-test="filters-search"]')).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test.json"]')).not.toBeVisible();
    await expect(page.locator('[data-test="song-preview"]')).toHaveAttribute('data-song', 'e2e-test-multitrack.json');

    // Clear search
    await page.keyboard.press('Backspace');
    await expect(page.locator('[data-test="filters-search"]')).toBeFocused();
    for (let i = 0; i < 'multitrack'.length; i++) await page.keyboard.press('Backspace');

    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test.json"]')).toBeVisible();
    await expect(page.locator('[data-test="filters-search"]')).not.toBeVisible();
});
