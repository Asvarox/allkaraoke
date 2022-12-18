import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

test('skip the intro from menu', async ({ page }) => {
    await page.goto('/?e2e-test');
    await page.locator('[data-test="advanced"]').click({ force: true });
    await page.locator('[data-test="save-button"]').click({ force: true });

    await page.locator('[data-test="sing-a-song"]').click({ force: true });
    await expect(page.locator('[data-test="song-preview"]')).toHaveAttribute('data-song', 'e2e-skip-intro-song.json');
    await page.keyboard.press('Enter'); // enter first song

    await page.locator('[data-test="skip-intro"]').click({ force: true });
    await expect(page.locator('[data-test="skip-intro"]')).toHaveAttribute('data-test-value', 'true');
    await page.locator('[data-test="next-step-button"]').click({ force: true });
    await page.locator('[data-test="play-song-button"]').click({ force: true });

    await page.locator('[data-test="highscores-button"]').click({ timeout: 15_000, force: true });
    await page.locator('[data-test="play-next-song-button"]').click({ force: true });
    await expect(page.locator('[data-test="song-preview"]')).toHaveAttribute('data-song', 'e2e-skip-intro-song.json');
    await page.keyboard.press('Enter'); // enter first song
    await expect(page.locator('[data-test="skip-intro"]')).toHaveAttribute('data-test-value', 'true');
});

test('skip the intro from the song', async ({ page }) => {
    await page.goto('/?e2e-test');
    await page.locator('[data-test="advanced"]').click({ force: true });
    await page.locator('[data-test="save-button"]').click({ force: true });

    await page.locator('[data-test="sing-a-song"]').click({ force: true });
    await expect(page.locator('[data-test="song-preview"]')).toHaveAttribute('data-song', 'e2e-skip-intro-song.json');
    await page.keyboard.press('Enter'); // enter first song

    await expect(page.locator('[data-test="skip-intro"]')).toHaveAttribute('data-test-value', 'false');
    await page.locator('[data-test="next-step-button"]').click({ force: true });
    await page.locator('[data-test="play-song-button"]').click({ force: true });

    await expect(page.locator('[data-test="skip-intro-info"]')).toBeVisible();
    await page.keyboard.press('Enter');

    await page.locator('[data-test="highscores-button"]').click({ timeout: 15_000, force: true });
});
