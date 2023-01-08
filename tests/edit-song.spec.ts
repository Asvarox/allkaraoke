import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

test('Edit song', async ({ page }) => {
    await page.goto('/?e2e-test');
    await page.getByTestId('skip').click({ force: true });
    await page.getByTestId('edit-songs').click();

    await page.locator('[data-test="edit-song"][data-song="e2e-test.json"]').click();

    await expect(page.locator('[data-test="source-url"] input')).toHaveValue('sourceUrl');

    await page.getByTestId('next-button').click();
    await expect(page.locator('[data-test="author-name"] input')).toHaveValue('author');
    await expect(page.locator('[data-test="author-url"] input')).toHaveValue('authorUrl');
    await expect(page.locator('[data-test="video-url"] input')).toHaveValue(
        'https://www.youtube.com/watch?v=mcEVAY1H5As',
    );

    await page.getByTestId('next-button').click();

    await expect(page.getByTestId('sync-lyrics')).toBeVisible();

    await page.getByTestId('next-button').click();

    await expect(page.locator('[data-test="song-language"] input')).toHaveValue('English');
    await expect(page.locator('[data-test="release-year"] input')).toHaveValue('1995');
    await expect(page.locator('[data-test="song-bpm"] input')).toHaveValue('200');
});
