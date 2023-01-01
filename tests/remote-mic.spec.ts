import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import connectRemotePhone from './steps/connectRemotePhone';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

test('Remote mic should connect and be selectable', async ({ page, context }) => {
    test.slow();
    await page.goto('/?e2e-test');
    await page.getByTestId('remote-mics').click({ force: true });

    // Connect blue microphone
    const remoteMicBluePage = await connectRemotePhone(page, context, 'E2E Test Blue');

    // Connect red microphone
    const remoteMicRed = await connectRemotePhone(page, context, 'E2E Test Red');

    // Assert auto selection of inputs
    await expect(page.getByTestId('mic-check-p1')).toContainText('E2E Test Blue', { ignoreCase: true });
    await expect(page.getByTestId('mic-check-p2')).toContainText('E2E Test Red', { ignoreCase: true });

    await page.getByTestId('save-button').click({ force: true });

    await expect(page.getByTestId('sing-a-song')).toBeVisible();

    // Check if the phones reconnect automatically
    await page.reload();

    await expect(remoteMicBluePage.getByTestId('connect-button')).toContainText('Connected', {
        ignoreCase: true,
    });

    await expect(remoteMicRed.getByTestId('connect-button')).toContainText('Connected', {
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
    await page.getByTestId('sing-a-song').click({ force: true });

    await page.getByTestId('song-e2e-test-multitrack.json').dblclick();
    await page.getByTestId('next-step-button').click({ force: true });
    await page.getByTestId('play-song-button').click({ force: true });
    await expect(page.getByTestId('highscores-button')).toBeVisible({ timeout: 20_000 });

    await expect(async () => {
        const p1score = await page.getByTestId('player-1-score').getAttribute('data-score');

        expect(parseInt(p1score!, 10)).toBeGreaterThan(100);
    }).toPass();

    await expect(page.getByTestId('player-1-name')).toHaveText('E2E Test Blue');
    await expect(page.getByTestId('player-2-name')).toHaveText('E2E Test Red');

    await page.getByTestId('highscores-button').click({ force: true });
    await page.getByTestId('play-next-song-button').click({ force: true });
    await expect(page.getByTestId('song-e2e-test-multitrack.json')).toBeVisible();
});
