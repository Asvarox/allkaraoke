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

    const remoteMicBluePage = await context.newPage();

    await remoteMicBluePage.goto(serverUrl);
    await remoteMicBluePage.locator('[data-test="player-name-input"]').fill('E2E Test Blue');
    await remoteMicBluePage.locator('[data-test="connect-button"]').click();
    await expect(remoteMicBluePage.locator('[data-test="connect-button"]')).toContainText('Connected', {
        ignoreCase: true,
    });

    const remoteMicRed = await context.newPage();

    await remoteMicRed.goto(serverUrl);
    await remoteMicRed.locator('[data-test="player-name-input"]').fill('E2E Test Red');
    await remoteMicRed.locator('[data-test="connect-button"]').click();
    await expect(remoteMicRed.locator('[data-test="connect-button"]')).toContainText('Connected', {
        ignoreCase: true,
    });

    await page.locator('[data-test="player-1-source"]').click();
    await page.locator('[data-test="player-1-source"]').click();
    await expect(page.locator('[data-test="player-1-input"]')).toContainText('E2E Test Blue', { ignoreCase: true });

    await page.locator('[data-test="player-2-source"]').click();
    await page.locator('[data-test="player-2-source"]').click();
    await page.locator('[data-test="player-2-input"]').click();
    await expect(page.locator('[data-test="player-2-input"]')).toContainText('E2E Test Red', { ignoreCase: true });

    await page.keyboard.press('Backspace');
    await page.reload();
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
