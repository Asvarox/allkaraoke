import { expect, test } from '@playwright/test';
import { initTestMode } from './helpers';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
});

test('Source selection', async ({ page }) => {
    test.slow();

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
