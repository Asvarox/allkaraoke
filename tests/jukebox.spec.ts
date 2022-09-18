import { expect, test } from '@playwright/test';

test('Jukebox', async ({ page }) => {
    await page.goto('/');

    await page.locator('[data-test="jukebox"]').click({ force: true });

    await page.waitForTimeout(150);
    await page.keyboard.press('ArrowUp'); // "skip song"
    await page.waitForTimeout(250);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);

    const selectedSong = await page.locator('[data-test="jukebox-container"]').getAttribute('data-song');

    await page.keyboard.press('ArrowDown'); // Sing this song
    await page.keyboard.press('Enter'); // Sing this song
    await expect(page.locator('[data-test="song-list-container"]')).toBeVisible();
    await page.waitForTimeout(100);
    await expect(page.locator('[data-test="song-preview"]')).toHaveAttribute('data-song', selectedSong!);
});
