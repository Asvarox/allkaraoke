import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

test('Remote mic should connect and be selectable', async ({ page, context }) => {
    test.slow();
    await page.goto('/');

    await page.locator('[data-test="select-input"]').click();
    const serverUrl = await page.locator('[data-test="server-link-input"]').inputValue();

    // Connect blue microphone
    const remoteMicBluePage = await context.newPage();

    await remoteMicBluePage.goto(serverUrl);
    await remoteMicBluePage.locator('[data-test="player-name-input"]').fill('E2E Test Blue');
    await remoteMicBluePage.locator('[data-test="connect-button"]').click();
    await expect(remoteMicBluePage.locator('[data-test="connect-button"]')).toContainText('Connected', {
        ignoreCase: true,
    });

    // Connect red microphone
    const remoteMicRed = await context.newPage();

    await remoteMicRed.goto(serverUrl);
    await remoteMicRed.locator('[data-test="player-name-input"]').fill('E2E Test Red');
    await remoteMicRed.locator('[data-test="connect-button"]').click();
    await expect(remoteMicRed.locator('[data-test="connect-button"]')).toContainText('Connected', {
        ignoreCase: true,
    });

    // Assert auto selection of inputs
    await expect(page.locator('[data-test="player-1-input"]')).toContainText('E2E Test Blue', { ignoreCase: true });
    await expect(page.locator('[data-test="player-2-input"]')).toContainText('E2E Test Red', { ignoreCase: true });

    await page.keyboard.press('Backspace');

    // Check if the phones reconnect automatically
    await page.reload();

    await expect(remoteMicBluePage.locator('[data-test="connect-button"]')).toContainText('Connected', {
        ignoreCase: true,
    });

    await expect(remoteMicRed.locator('[data-test="connect-button"]')).toContainText('Connected', {
        ignoreCase: true,
    });

    await Promise.race([
        expect(page.locator('.Toastify')).toContainText('E2E Test Blue connected', {
            ignoreCase: true,
        }),
        expect(page.locator('.Toastify')).toContainText('E2E Test Red connected', {
            ignoreCase: true,
        }),
    ]);

    // Check singing a song
    await page.locator('[data-test="sing-a-song"]').click({ force: true });

    await page.locator('[data-test="song-e2e-test-multitrack.json"]').dblclick();
    await page.locator('[data-test="next-step-button"]').click({ force: true });
    await page.locator('[data-test="play-song-button"]').click({ force: true });
    await expect(page.locator('[data-test="highscores-button"]')).toBeVisible({ timeout: 20_000 });

    await page.waitForTimeout(1000); // let the animation score run for a while
    const p1score = await page.locator('[data-test="player-1-score"]').getAttribute('data-score');

    expect(parseInt(p1score!, 10)).toBeGreaterThan(100);

    await expect(page.locator('[data-test="player-1-name"]')).toHaveText('E2E Test Blue');
    await expect(page.locator('[data-test="player-2-name"]')).toHaveText('E2E Test Red');

    await page.locator('[data-test="highscores-button"]').click({ force: true });
    await page.locator('[data-test="play-next-song-button"]').click({ force: true });
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();
});
