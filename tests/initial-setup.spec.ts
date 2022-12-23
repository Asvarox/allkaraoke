import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs, stubUserMedia } from './helpers';
import connectRemotePhone from './steps/connectRemotePhone';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

test('SingStar wireless mic is detected properly', async ({ page, context }) => {
    const { connectDevices, disconnectDevices } = await stubUserMedia({ page, context });

    await page.goto('/?e2e-test');

    await page.getByTestId('mics').click({ force: true });
    await expect(page.getByTestId('setup-not-completed')).toBeVisible();

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

    await page.getByTestId('player-1-input').click();
    await expect(page.getByTestId('player-1-input')).toContainText('Multichannel (ch 1)', { ignoreCase: true });
    await page.getByTestId('player-1-input').click();
    await expect(page.getByTestId('player-1-input')).toContainText('Multichannel (ch 2)', { ignoreCase: true });
});

test('Remote mic is deselected when it disconnects', async ({ page, context }) => {
    await stubUserMedia({ page, context });
    await page.goto('/?e2e-test');

    await page.getByTestId('advanced').click({ force: true });

    const remotePhone = await connectRemotePhone(page, context, 'Remote Phone Test');

    await expect(page.getByTestId('player-1-source')).toContainText('Remote microphone', { ignoreCase: true });
    await expect(page.getByTestId('player-1-input')).toContainText('Remote Phone Test', { ignoreCase: true });

    await remotePhone.close();

    await expect(page.getByTestId('player-1-input')).toContainText('Default device', {
        ignoreCase: true,
        timeout: 10_000,
    });
});
