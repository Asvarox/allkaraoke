import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

test('Filters', async ({ page }) => {
    await page.goto('/');

    await page.locator('[data-test="sing-a-song"]').click({ force: true });

    await expect(page.locator('[data-test="song-e2e-test.json"]')).toBeVisible();
    await page.keyboard.type('f'); // Show filters
    await expect(page.locator('[data-test="song-list-filters"]')).toBeVisible();

    await page.keyboard.press('Enter'); // focus search song
    await page.keyboard.type('multitrack');
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test.json"]')).not.toBeVisible();
    for (let i = 0; i < 10; i++) await page.keyboard.press('Backspace');
    await page.keyboard.press('Enter');

    await page.keyboard.press('ArrowRight'); // language filters
    await page.keyboard.press('Enter'); // polish
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test.json"]')).not.toBeVisible();
    await page.keyboard.press('Enter'); // english
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).not.toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test.json"]')).toBeVisible();
    await page.keyboard.press('Enter'); // All

    await page.keyboard.press('ArrowRight'); // duet filters
    await page.keyboard.press('Enter'); // Duet
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test.json"]')).not.toBeVisible();
    await page.keyboard.press('Enter'); // Solo
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).not.toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test.json"]')).toBeVisible();
    await page.keyboard.press('Enter'); // All
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test.json"]')).toBeVisible();
    // Quick search
    await page.keyboard.type('multitrack');
    await page.keyboard.press('Enter'); // All
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test.json"]')).not.toBeVisible();
    await expect(page.locator('[data-test="song-preview"]')).toHaveAttribute('data-song', 'e2e-test-multitrack.json');
});
