import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

test.beforeEach(async ({ page }) => {
    await initTestMode(page);
    await mockSongs(page);
});

test('Remote mic should connect and be selectable', async ({ page, context }) => {
    await page.goto('/');

    await page.locator('[data-test="select-input"]').click();

    const serverUrl = await page.locator('[data-test="server-link-input"]').inputValue();

    const remoteMicPage = await context.newPage();

    await remoteMicPage.goto(serverUrl);
    await remoteMicPage.locator('[data-test="player-name-input"]').fill('E2E Test');
    await remoteMicPage.locator('[data-test="connect-button"]').click();
    await expect(remoteMicPage.locator('[data-test="connect-button"]')).toContainText('Connected', {
        ignoreCase: true,
    });

    await page.locator('[data-test="player-1-source"]').click();
    await page.locator('[data-test="player-1-source"]').click();

    await expect(page.locator('[data-test="player-1-input"]')).toContainText('E2E Test', { ignoreCase: true });

    await page.locator('[data-test="player-2-source"]').click();

    await page.keyboard.press('Backspace');
    await page.locator('[data-test="sing-a-song"]').click({ force: true });

    await page.locator('[data-test="song-e2e-test-multitrack.json"]').dblclick();
    await page.locator('[data-test="play-song-button"]').click({ force: true });
    await expect(page.locator('[data-test="play-next-song-button"]')).toBeVisible({ timeout: 20_000 });

    await page.waitForTimeout(1000); // let the animation score run for a while
    const p1score = await page.locator('[data-test="player-1-score"]').getAttribute('data-score');

    expect(parseInt(p1score!, 10)).toBeGreaterThan(100);

    await page.locator('[data-test="play-next-song-button"]').click({ force: true });
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();
});
