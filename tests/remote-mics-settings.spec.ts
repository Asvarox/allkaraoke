import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import openAndConnectRemoteMic, { connectRemoteMic } from './steps/openAndConnectRemoteMic';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

test('Should properly reset data settings', async ({ browser, page, context }) => {
    const name = 'E2E Test Blue';

    await page.goto('/?e2e-test');
    await page.getByTestId('remote-mics').click();

    const remoteMic = await openAndConnectRemoteMic(page, context, name);

    await remoteMic.reload();

    await expect(remoteMic.getByTestId('player-name-input')).toHaveValue(name);

    await remoteMic.getByTestId('menu-settings').click();
    const remoteMicId = await remoteMic.getByTestId('remote-mic-id').textContent();

    await remoteMic.getByTestId('reset-microphone').click();
    await expect(remoteMic.getByTestId('player-name-input')).toHaveValue('');
    await remoteMic.getByTestId('menu-settings').click();
    await expect(remoteMic.getByTestId('remote-mic-id')).not.toContainText(remoteMicId!);
});

test('Should properly manage mics', async ({ browser, page, context }) => {
    await page.goto('/?e2e-test');
    await page.getByTestId('remote-mics').click();

    const remoteMic1 = await openAndConnectRemoteMic(page, await browser.newContext(), 'Player 1');
    const remoteMic2 = await openAndConnectRemoteMic(page, await browser.newContext(), 'Player 2');
    await expect(remoteMic2.getByTestId('indicator')).toHaveAttribute('data-player-number', '1');

    await test.step('Changes other players number', async () => {
        await remoteMic1.getByTestId('menu-settings').click();
        await remoteMic1.getByText('Player 2').click();
        await remoteMic1.getByTestId('change-to-unset').click();
        await expect(remoteMic2.getByTestId('indicator')).toHaveAttribute('data-player-number', 'none');
    });

    await test.step('Can still assign players after refresh', async () => {
        await remoteMic1.reload();
        await connectRemoteMic(remoteMic1);

        await remoteMic1.getByTestId('menu-settings').click();
        await remoteMic1.getByText('Player 2').click();
        await remoteMic1.getByTestId('change-to-player-0').click();
        await expect(remoteMic2.getByTestId('indicator')).toHaveAttribute('data-player-number', '0');
        await remoteMic1.getByTestId('menu-microphone').click();
        await expect(remoteMic1.getByTestId('indicator')).toHaveAttribute('data-player-number', 'none');
    });
});
