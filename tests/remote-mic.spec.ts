import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import connectRemotePhone from './steps/connectRemotePhone';
import navigateWithKeyboard from './steps/navigateWithKeyboard';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

// Service worker caches index.json which breaks playwright's request intercept (mocking of song list)
// Not disabling it globaly so in case SW breaks the app it is caught by other tests
test.use({ serviceWorkers: 'block' });

test('Remote mic should connect, be selectable and control the game', async ({ page, context, browserName }) => {
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

    await navigateWithKeyboard(page, 'save-button', remoteMicBluePage);
    await remoteMicBluePage.getByTestId('keyboard-enter').click({ force: true });

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

    // Check if the mics are reselected after they refresh
    await remoteMicBluePage.reload();
    await remoteMicBluePage.getByTestId('player-name-input').fill('E2E Test Blue');
    await remoteMicBluePage.getByTestId('connect-button').click();
    await expect(remoteMicBluePage.getByTestId('indicator')).toHaveAttribute('data-player-number', '0');

    await remoteMicRed.reload();
    await remoteMicRed.getByTestId('player-name-input').fill('E2E Test Red');
    await remoteMicRed.getByTestId('connect-button').click();
    await expect(remoteMicRed.getByTestId('indicator')).toHaveAttribute('data-player-number', '1');

    // Check singing a song
    await navigateWithKeyboard(page, 'sing-a-song', remoteMicBluePage);
    await remoteMicBluePage.getByTestId('keyboard-enter').click({ force: true });

    await navigateWithKeyboard(page, 'song-e2e-skip-intro-song.json', remoteMicBluePage);
    await remoteMicBluePage.getByTestId('keyboard-enter').click({ force: true });

    await navigateWithKeyboard(page, 'next-step-button', remoteMicRed);
    await remoteMicRed.getByTestId('keyboard-enter').click({ force: true });
    await navigateWithKeyboard(page, 'play-song-button', remoteMicRed);
    await remoteMicRed.getByTestId('keyboard-enter').click({ force: true });

    // Check if restart song is possible
    await expect(page.getByTestId('lyrics-current-player-1')).toBeVisible();
    await expect(remoteMicBluePage.getByTestId('keyboard-enter')).not.toBeDisabled();
    await remoteMicBluePage.getByTestId('keyboard-backspace').click({ force: true });
    await navigateWithKeyboard(page, 'button-restart-song', remoteMicRed);
    await remoteMicRed.getByTestId('keyboard-enter').click({ force: true });

    // Check if skip intro is possible

    await expect(page.getByTestId('skip-intro-info')).toBeVisible();
    await page.waitForTimeout(1500);
    await remoteMicRed.getByTestId('keyboard-enter').click({ force: true });

    await expect(page.getByTestId('highscores-button')).toBeVisible({ timeout: 15_000 });

    test.fixme(browserName === 'firefox', 'Remote mics dont get any microphone input on FF :(');

    await expect(async () => {
        const p1score = await page.getByTestId('player-1-score').getAttribute('data-score');

        expect(parseInt(p1score!, 10)).toBeGreaterThan(100);
    }).toPass();

    await expect(page.getByTestId('player-1-name')).toHaveText('E2E Test Blue');
    await expect(page.getByTestId('player-2-name')).toHaveText('E2E Test Red');

    await expect(page.getByTestId('highscores-button')).toBeVisible();
    await remoteMicBluePage.getByTestId('keyboard-enter').click({ force: true });
    await expect(page.getByTestId('play-next-song-button')).toBeVisible();
    await remoteMicBluePage.getByTestId('keyboard-enter').click({ force: true });
    await expect(page.getByTestId('song-e2e-skip-intro-song.json')).toBeVisible();
});
