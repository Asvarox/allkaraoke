import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import connectRemoteMic from './steps/connectRemoteMic';
import { expectMonitoringToBeEnabled } from './steps/assertMonitoringStatus';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

test('Source selection in sing settings', async ({ page, context }) => {
    await page.goto('/?e2e-test');
    await page.getByTestId('skip').click();

    await page.getByTestId('sing-a-song').click();
    await expect(page.getByTestId('lang-Polish')).toBeVisible();
    await page.getByTestId('close-exclude-languages').click();
    await page.getByTestId('song-e2e-multitrack-polish-1994.json').dblclick();
    await page.getByTestId('next-step-button').click();
    await page.getByTestId('select-inputs-button').click();
    await page.getByTestId('advanced').click();

    // Connect blue microphone
    const remoteMic = await connectRemoteMic(page, context, 'E2E Test Blue');
    // Assert auto selection of inputs
    await expect(page.getByTestId('player-0-input')).toContainText('E2E Test Blue', { ignoreCase: true });

    await expect(page.locator('.Toastify')).toContainText('E2E Test Blue connected', {
        ignoreCase: true,
    });

    await page.getByTestId('save-button').click();

    await expect(page.getByTestId('player-0-name')).toHaveAttribute('placeholder', 'E2E Test Blue');

    // Make sure the microphone of new device is being monitored
    await expect(remoteMic.getByTestId('monitoring-state')).toContainText('on', {
        ignoreCase: true,
    });

    // Make sure the input isn't monitored anymore if it's not in use
    await page.getByTestId('select-inputs-button').click();
    await page.getByTestId('advanced').click();
    await page.getByTestId('player-0-source').click();
    await expect(remoteMic.getByTestId('monitoring-state')).toContainText('off', {
        ignoreCase: true,
    });
});

test('Source selection in in-game menu', async ({ page, context }) => {
    await page.goto('/?e2e-test');
    await expect(page.getByTestId('advanced')).toBeVisible();
    await page.getByTestId('advanced').click();
    await page.getByTestId('save-button').click();

    await page.getByTestId('sing-a-song').click();
    await expect(page.getByTestId('lang-Polish')).toBeVisible();
    await page.getByTestId('close-exclude-languages').click();
    await page.getByTestId('song-e2e-multitrack-polish-1994.json').dblclick();
    await page.getByTestId('next-step-button').click();
    await page.getByTestId('play-song-button').click();

    await expect(async () => {
        const p1score = await page.getByTestId('players-score').getAttribute('data-score');

        expect(parseInt(p1score!, 10)).toBeGreaterThan(100);
    }).toPass({ timeout: 15_000 });

    await page.keyboard.press('Backspace');

    // Make sure the input isn't monitored anymore if it's not in use
    await page.getByTestId('input-settings').click();
    await page.getByTestId('advanced').click();
    await page.getByTestId('player-0-source').click();
    await page.getByTestId('save-button').click();
    await expectMonitoringToBeEnabled(page);
});

test('Source selection from remote mic', async ({ page, context }) => {
    await page.goto('/?e2e-test');
    await page.getByTestId('remote-mics').click();

    // Connect blue microphone
    const remoteMicBluePage = await connectRemoteMic(page, context, 'E2E Test Blue');

    // Connect red microphone
    const remoteMicRed = await connectRemoteMic(page, context, 'E2E Test Red');

    await test.step('change red player mic to blue', async () => {
        await remoteMicRed.getByTestId('change-player').click();
        await remoteMicRed.getByTestId('change-to-player-0').click();
        await expect(page.getByTestId('mic-check-p0')).toContainText('E2E Test Red', { ignoreCase: true });
        await expect(page.getByTestId('mic-check-p1')).toContainText('Player #2', { ignoreCase: true });
    });
    await test.step('change blue player mic to red', async () => {
        await remoteMicBluePage.getByTestId('change-player').click();
        await remoteMicBluePage.getByTestId('change-to-player-1').click();
        await expect(page.getByTestId('mic-check-p0')).toContainText('E2E Test Red', { ignoreCase: true });
        await expect(page.getByTestId('mic-check-p1')).toContainText('E2E Test blue', { ignoreCase: true });
    });
    await test.step('Unset a player', async () => {
        await remoteMicBluePage.getByTestId('change-player').click();
        await remoteMicBluePage.getByTestId('change-to-unset').click();
        await expect(page.getByTestId('mic-check-p1')).toContainText('Player #2', { ignoreCase: true });
    });
});
