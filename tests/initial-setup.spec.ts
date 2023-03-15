import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs, stubUserMedia } from './helpers';
import connectRemoteMic from './steps/connectRemoteMic';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

test('SingStar wireless mic is detected properly', async ({ page, context }) => {
    const { connectDevices, disconnectDevices } = await stubUserMedia({ page, context });

    await page.goto('/?e2e-test');

    await page.getByTestId('mics').click({ force: true });
    await expect(page.getByTestId('advanced-tip')).toBeVisible();

    const singstarDevice = {
        id: 'test',
        label: 'wireless mic #2137',
        channels: 2,
    };

    await connectDevices(singstarDevice);

    await expect(page.getByTestId('setup-completed')).toBeVisible();
    await disconnectDevices(singstarDevice);
    await expect(page.getByTestId('setup-not-completed')).toBeVisible();
});

test('Default device is selected currently selected mic is disconnected', async ({ page, context }) => {
    const { connectDevices, disconnectDevices } = await stubUserMedia({ page, context });
    await page.goto('/?e2e-test');

    const newDevice = {
        id: 'new-device',
        label: 'New device',
        channels: 1,
    };
    await connectDevices(newDevice);

    await page.getByTestId('advanced').click({ force: true });

    await page.getByTestId('player-1-source').click();
    await page.getByTestId('player-1-input').click();
    await expect(page.getByTestId('player-1-input')).toContainText('New device', { ignoreCase: true });

    await disconnectDevices(newDevice);
    await expect(page.getByTestId('player-1-input')).toContainText('Default device', { ignoreCase: true });

    await connectDevices(newDevice);
    await expect(page.getByTestId('player-1-input')).toContainText('New device', { ignoreCase: true });
});
test('Properly labels multichannel devices', async ({ page, context }) => {
    const { connectDevices } = await stubUserMedia({ page, context });
    await page.goto('/?e2e-test');

    const newDevice = {
        id: 'multichannel-device',
        label: 'Multichannel',
        channels: 2,
    };
    await connectDevices(newDevice);

    await page.getByTestId('advanced').click({ force: true });

    await page.getByTestId('player-1-source').click();
    await page.getByTestId('player-1-input').click();
    await expect(page.getByTestId('player-1-input')).toContainText('Multichannel (ch 1)', { ignoreCase: true });
    await page.getByTestId('player-1-input').click();
    await expect(page.getByTestId('player-1-input')).toContainText('Multichannel (ch 2)', { ignoreCase: true });
});

test('Remote mic is deselected when it disconnects', async ({ page, context }) => {
    await stubUserMedia({ page, context });
    await page.goto('/?e2e-test');

    await page.getByTestId('advanced').click({ force: true });

    const remoteMic = await connectRemoteMic(page, context, 'Remote Mic Test');

    await expect(page.getByTestId('player-1-source')).toContainText('Remote microphone', { ignoreCase: true });
    await expect(page.getByTestId('player-1-input')).toContainText('Remote Mic Test', { ignoreCase: true });

    await remoteMic.close();

    await expect(page.getByTestId('player-1-input')).toContainText('Default device', {
        ignoreCase: true,
        timeout: 10_000,
    });
});

test('Default microphone is selected for built-in', async ({ page, context }) => {
    const { connectDevices } = await stubUserMedia({ page, context });
    await page.goto('/?e2e-test');

    await connectDevices({
        id: 'not-related-device',
        label: 'Not related',
        channels: 2,
    });

    await page.getByTestId('built-in').click({ force: true });

    await expect(page.getByTestId('selected-mic')).toContainText('Default device');
    // Select some different mic
    await page.getByTestId('back-button').click({ force: true });
    await page.getByTestId('advanced').click({ force: true });
    await page.getByTestId('player-1-input').click({ force: true });
    await page.getByTestId('player-2-input').click({ force: true });

    // Make sure that it still selects the default one
    await page.getByTestId('back-button').click({ force: true });
    await page.getByTestId('built-in').click({ force: true });
    await expect(page.getByTestId('selected-mic')).toContainText('Default device');

    // Check if the initial setup doesn't show after refresh
    await page.getByTestId('save-button').click({ force: true });

    await page.reload();

    await expect(page.getByTestId('sing-a-song')).toBeVisible();
});
