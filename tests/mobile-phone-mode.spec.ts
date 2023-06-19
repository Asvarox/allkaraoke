import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import connectRemoteMic from './steps/connectRemoteMic';
import navigateWithKeyboard from './steps/navigateWithKeyboard';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

// Service worker caches index.json which breaks playwright's request intercept (mocking of song list)
// Not disabling it globally so in case SW breaks the app it is caught by other tests
test.use({ serviceWorkers: 'block' });
test.use({ viewport: { width: 740, height: 360 } }); // Samsung S8+

test('Mobile phone mode should be dismissible', async ({ page }) => {
    await page.goto('/?e2e-test');
    await page.getByTestId('dismiss-mobile-mode').click();
    await expect(page.getByTestId('mics')).toBeVisible(); // Singstar Mics is hidden when in Mobile Mode
});

const P1_Name = 'E2E Test Blue';
const P2_Name = 'E2E Test Red';

test('Mobile phone mode should be playable', async ({ page, context, browserName }) => {
    test.fixme(browserName === 'firefox', 'Test fails super often on FF');
    test.slow();
    await page.goto('/?e2e-test');
    await page.getByTestId('enable-mobile-mode').click();
    await page.getByTestId('remote-mics').click();

    // Connect blue microphone
    const remoteMicBluePage = await connectRemoteMic(page, context, P1_Name);

    // Connect red microphone
    const remoteMicRed = await connectRemoteMic(page, context, P2_Name);

    // Assert auto selection of inputs
    await expect(page.getByTestId('mic-check-p0')).toContainText(P1_Name, { ignoreCase: true });
    await expect(page.getByTestId('mic-check-p1')).toContainText(P2_Name, { ignoreCase: true });

    await navigateWithKeyboard(page, 'save-button', remoteMicBluePage);
    await remoteMicBluePage.getByTestId('keyboard-enter').click();

    await expect(page.getByTestId('sing-a-song')).toBeVisible();

    // Check if the remote mics reconnect automatically
    await page.waitForTimeout(500);
    await page.reload();

    await expect(remoteMicBluePage.getByTestId('connect-button')).toContainText('Connected', {
        ignoreCase: true,
    });

    await expect(remoteMicRed.getByTestId('connect-button')).toContainText('Connected', {
        ignoreCase: true,
    });

    await Promise.race([
        expect(page.locator('.Toastify')).toContainText(`${P1_Name} connected`, {
            ignoreCase: true,
        }),
        expect(page.locator('.Toastify')).toContainText(`${P2_Name} connected`, {
            ignoreCase: true,
        }),
    ]);

    // Check if the mics are reselected after they refresh
    await remoteMicBluePage.reload();
    await remoteMicBluePage.getByTestId('player-name-input').fill(P1_Name);
    await remoteMicBluePage.getByTestId('connect-button').click();
    await expect(remoteMicBluePage.getByTestId('indicator')).toHaveAttribute('data-player-number', '0');

    await remoteMicRed.reload();
    await remoteMicRed.getByTestId('player-name-input').fill(P2_Name);
    await remoteMicRed.getByTestId('connect-button').click();
    await expect(remoteMicRed.getByTestId('indicator')).toHaveAttribute('data-player-number', '1');

    await test.step('Start singing a song', async () => {
        await navigateWithKeyboard(page, 'sing-a-song', remoteMicBluePage);
        await remoteMicBluePage.getByTestId('keyboard-enter').click();
        await navigateWithKeyboard(page, 'close-exclude-languages', remoteMicBluePage);
        await remoteMicBluePage.getByTestId('keyboard-enter').click();

        await navigateWithKeyboard(page, 'song-e2e-skip-intro-polish.json', remoteMicBluePage);
        await remoteMicBluePage.getByTestId('keyboard-enter').click();

        await navigateWithKeyboard(page, 'next-step-button', remoteMicRed);
        await remoteMicRed.getByTestId('keyboard-enter').click();
        await navigateWithKeyboard(page, 'play-song-button', remoteMicRed);
        await remoteMicRed.getByTestId('keyboard-enter').click();
    });

    await test.step('Check if skip intro is possible', async () => {
        await remoteMicBluePage.getByTestId('ready-button').click();
        await remoteMicRed.getByTestId('ready-button').click();
        await expect(remoteMicRed.getByTestId('keyboard-enter')).not.toBeDisabled({ timeout: 8_000 });
        await page.waitForTimeout(1500);
        await remoteMicRed.getByTestId('keyboard-enter').click();

        await expect(page.getByTestId('highscores-button')).toBeVisible({ timeout: 15_000 });
    });

    test.fixme(browserName === 'firefox', 'Remote mics dont get any microphone input on FF :(');

    await expect(async () => {
        const p1score = await page.getByTestId('player-0-score').getAttribute('data-score');

        expect(parseInt(p1score!, 10)).toBeGreaterThan(100);
    }).toPass();

    await expect(page.getByTestId('player-0-name')).toHaveText(P1_Name);
    await expect(page.getByTestId('player-1-name')).toHaveText(P2_Name);

    await expect(page.getByTestId('highscores-button')).toBeVisible();
    await remoteMicBluePage.getByTestId('keyboard-enter').click();
    await expect(page.getByTestId('play-next-song-button')).toBeVisible();
    await remoteMicBluePage.getByTestId('keyboard-enter').click();
    await expect(page.getByTestId('song-e2e-skip-intro-polish.json')).toBeVisible();
});
