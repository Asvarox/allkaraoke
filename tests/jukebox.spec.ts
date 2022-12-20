import { expect, test } from '@playwright/test';

test('Jukebox', async ({ page }) => {
    await page.goto('/?e2e-test');
    await page.getByTestId('skip').click({ force: true });
    await page.getByTestId('save-button').click({ force: true });

    await page.getByTestId('jukebox').click({ force: true });

    await page.waitForTimeout(150);
    await page.keyboard.press('ArrowUp'); // "skip song"
    await expect(page.locator('[data-test="skip-button"][data-focused]')).toBeVisible();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const selectedSong = await page.getByTestId('jukebox-container').getAttribute('data-song');

    await page.keyboard.press('ArrowDown'); // Sing this song
    await expect(page.locator('[data-test="sing-button"][data-focused]')).toBeVisible();
    await page.keyboard.press('Enter'); // Sing this song
    await expect(page.getByTestId('song-list-container')).toBeVisible();
    await expect(page.getByTestId('song-preview')).toHaveAttribute('data-song', selectedSong!);
});
