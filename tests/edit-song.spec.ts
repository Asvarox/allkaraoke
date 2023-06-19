import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

// Service worker caches index.json which breaks playwright's request intercept (mocking of song list)
// Not disabling it globally so in case SW breaks the app it is caught by other tests
test.use({ serviceWorkers: 'block' });

test('Edit song', async ({ page }) => {
    await page.goto('/?e2e-test');
    await page.getByTestId('skip').click();
    await page.getByTestId('manage-songs').click();
    await page.getByTestId('edit-songs').click();

    await page.locator('[data-test="edit-song"][data-song="e2e-single-english-1995.json"]').click();

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

    await expect(page.locator('[data-test="song-language"]')).toContainText('English');
    await expect(page.locator('[data-test="release-year"] input')).toHaveValue('1995');
    await expect(page.locator('[data-test="song-bpm"] input')).toHaveValue('200');
});
