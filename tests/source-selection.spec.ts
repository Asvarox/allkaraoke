import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import connectRemotePhone from './steps/connectRemotePhone';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

test('Source selection in sing settings', async ({ page, context }) => {
    await page.goto('/?e2e-test');
    await page.getByTestId('skip').click({ force: true });

    await page.getByTestId('sing-a-song').click({ force: true });
    await page.getByTestId('song-e2e-test-multitrack.json').dblclick();
    await page.getByTestId('next-step-button').click({ force: true });
    await page.getByTestId('select-inputs-button').click({ force: true });
    await page.getByTestId('advanced').click({ force: true });

    // Connect blue microphone
    const remoteMic = await connectRemotePhone(page, context, 'E2E Test Blue');
    // Assert auto selection of inputs
    await expect(page.getByTestId('player-1-input')).toContainText('E2E Test Blue', { ignoreCase: true });

    await expect(page.locator('.Toastify')).toContainText('E2E Test Blue connected', {
        ignoreCase: true,
    });

    await page.getByTestId('save-button').click({ force: true });

    await expect(page.getByTestId('player-1-name')).toHaveAttribute('placeholder', 'E2E Test Blue');

    // Make sure the microphone of new device is being monitored
    await expect(remoteMic.getByTestId('monitoring-state')).toContainText('on', {
        ignoreCase: true,
    });

    // Make sure the input isn't monitored anymore if it's not in use
    await page.getByTestId('select-inputs-button').click({ force: true });
    await page.getByTestId('advanced').click({ force: true });
    await page.getByTestId('player-1-source').click();
    await expect(remoteMic.getByTestId('monitoring-state')).toContainText('off', {
        ignoreCase: true,
    });
});

test('Source selection from remote phone', async ({ page, context }) => {
    await page.goto('/?e2e-test');
    await page.getByTestId('remote-mics').click({ force: true });

    // Connect blue microphone
    const remoteMicBluePage = await connectRemotePhone(page, context, 'E2E Test Blue');

    // Connect red microphone
    const remoteMicRed = await connectRemotePhone(page, context, 'E2E Test Red');

    await test.step('change red player mic to blue', async () => {
        await remoteMicRed.getByTestId('change-player').click({ force: true });
        await remoteMicRed.getByTestId('change-to-player-1').click({ force: true });
        await expect(page.getByTestId('mic-check-p1')).toContainText('E2E Test Red', { ignoreCase: true });
        await expect(page.getByTestId('mic-check-p2')).toContainText('...', { ignoreCase: true });
    });
    await test.step('change blue player mic to red', async () => {
        await remoteMicBluePage.getByTestId('change-player').click({ force: true });
        await remoteMicBluePage.getByTestId('change-to-player-2').click({ force: true });
        await expect(page.getByTestId('mic-check-p1')).toContainText('E2E Test Red', { ignoreCase: true });
        await expect(page.getByTestId('mic-check-p2')).toContainText('E2E Test blue', { ignoreCase: true });
    });
    await test.step('Unset a player', async () => {
        await remoteMicBluePage.getByTestId('change-player').click({ force: true });
        await remoteMicBluePage.getByTestId('change-to-unset').click({ force: true });
        await expect(page.getByTestId('mic-check-p2')).toContainText('...', { ignoreCase: true });
    });
});
