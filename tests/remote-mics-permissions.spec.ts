import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import connectRemoteMic from './steps/connectRemoteMic';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

test('Should properly manage remote mics permission settings', async ({ page, context }) => {
    await page.goto('/?e2e-test');
    await page.getByTestId('skip').click();
    await page.getByTestId('settings').click();
    await page.getByTestId('remote-mics-settings').click();

    await test.step('sets and remembers default permission', async () => {
        await expect(await page.getByTestId('default-permission')).toContainText('WRITE', { ignoreCase: true });
        await page.getByTestId('default-permission').click();
        await expect(await page.getByTestId('default-permission')).toContainText('READ', { ignoreCase: true });
        await page.reload();
        await expect(await page.getByTestId('default-permission')).toContainText('READ', { ignoreCase: true });
    });

    await page.getByTestId('quick-connect-phone').click();
    const remoteMic = await connectRemoteMic(page, context, 'E2E Test Blue');
    await page.getByTestId('quick-connect-close').click();

    await test.step('newly connected phone gets default permission', async () => {
        await expect(await remoteMic.getByTestId('no-permissions-message')).toBeVisible();
        await expect(await remoteMic.getByTestId('remote-keyboard')).not.toBeVisible();
        await expect(await remoteMic.getByTestId('change-player')).not.toBeVisible();
    });

    await test.step('write access allows for keyboard and change player', async () => {
        await page.getByTestId('remote-mic-entry').click();
        await expect(await remoteMic.getByTestId('remote-keyboard')).toBeVisible();
        await expect(await remoteMic.getByTestId('change-player')).toBeVisible();
    });

    await test.step('selected permission is persisted for the remote mic', async () => {
        await remoteMic.reload();
        await remoteMic.getByTestId('connect-button').click();

        await expect(await remoteMic.getByTestId('remote-keyboard')).toBeVisible();
        await expect(await remoteMic.getByTestId('change-player')).toBeVisible();
    });
});
