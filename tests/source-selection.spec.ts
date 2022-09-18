import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        window.Math.random = () => 0.5;

        // @ts-expect-error
        window.isE2ETests = true;
    });
});

test('Source selection', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-test="select-input"]').click();
    await page.locator('[data-test="player-1-source"]').click();
    await page.locator('[data-test="player-1-input"]').click();
    await page.locator('[data-test="player-1-input"]').click();
    await page.locator('[data-test="player-1-source"]').click();
    await page.locator('[data-test="player-1-input"]').click();
    await page.locator('[data-test="player-1-input"]').click();
    await page.locator('[data-test="player-1-input"]').click();
    await page.locator('[data-test="player-1-input"]').click();
    await page.locator('[data-test="player-1-input"]').click();
    await page.locator('[data-test="player-1-input"]').click();
    await page.locator('[data-test="player-2-source"]').click();
    await page.locator('[data-test="player-2-source"]').click();
    await page.locator('[data-test="player-2-source"]').click();
    await page.locator('[data-test="player-2-input"]').click();
    await page.locator('[data-test="player-2-input"]').click();
    await page.locator('[data-test="player-2-input"]').click();
    await page.locator('[data-test="player-2-source"]').click();
    await page.locator('[data-test="player-2-input"]').click();
    await page.locator('[data-test="player-2-input"]').click();
    await page.locator('[data-test="player-2-input"]').click();
    await expect(page.locator('[data-test="mic-mismatch-warning"]')).toBeVisible();
});
