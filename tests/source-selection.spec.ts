import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

test('Source selection', async ({ page }) => {
    test.slow();

    await page.goto('/?e2e-test');
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

test('Source selection in sing settings', async ({ page, context }) => {
    await page.goto('/?e2e-test');

    await page.locator('[data-test="sing-a-song"]').click({ force: true });
    await page.locator('[data-test="song-e2e-test-multitrack.json"]').dblclick();
    await page.locator('[data-test="next-step-button"]').click({ force: true });
    await page.locator('[data-test="select-inputs-button"]').click({ force: true });

    const serverUrl = await page.locator('[data-test="server-link-input"]').inputValue();

    // Connect blue microphone
    const remoteMic = await context.newPage();
    await remoteMic.goto(serverUrl);
    await remoteMic.locator('[data-test="player-name-input"]').fill('E2E Test Blue');
    await remoteMic.locator('[data-test="connect-button"]').click();
    await expect(remoteMic.locator('[data-test="connect-button"]')).toContainText('Connected', {
        ignoreCase: true,
    });

    // Assert auto selection of inputs
    await expect(page.locator('[data-test="player-1-input"]')).toContainText('E2E Test Blue', { ignoreCase: true });

    await expect(page.locator('.Toastify')).toContainText('E2E Test Blue connected', {
        ignoreCase: true,
    });

    await page.locator('[data-test="back-button"]').click({ force: true });

    await expect(page.locator('[data-test="player-1-name"]')).toHaveAttribute('placeholder', 'E2E Test Blue');

    // Make sure the microphone of new device is being monitored
    await expect(remoteMic.locator('[data-test="monitoring-state"]')).toContainText('on', {
        ignoreCase: true,
    });

    // Make sure the input isn't monitored anymore if it's not in use
    await page.locator('[data-test="select-inputs-button"]').click({ force: true });
    await page.locator('[data-test="player-1-source"]').click();
    await expect(remoteMic.locator('[data-test="monitoring-state"]')).toContainText('off', {
        ignoreCase: true,
    });
});
