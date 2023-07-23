import { expect, test } from '@playwright/test';
import { txtfile } from './fixtures/newsongtxt';
import { initTestMode, mockSongs } from './helpers';
import { connectRemoteMic } from './steps/openAndConnectRemoteMic';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

// Service worker caches index.json which breaks playwright's request intercept (mocking of song list)
// Not disabling it globally so in case SW breaks the app it is caught by other tests
test.use({ serviceWorkers: 'block' });

const P1_Name = 'E2E Test Blue';

test('Remote mic song list', async ({ page, context, browserName }) => {
    test.fixme(browserName === 'firefox', 'Test fails super often on FF');
    test.slow();
    await page.goto('/?e2e-test');
    await page.getByTestId('remote-mics').click();

    const remoteMic = await context.newPage();
    await mockSongs({ page: remoteMic, context });
    const serverUrl = await page.getByTestId('server-link-input').inputValue();

    await remoteMic.goto(serverUrl);
    await remoteMic.getByTestId('player-name-input').fill(P1_Name);

    await test.step('Song list is available without connecting', async () => {
        await remoteMic.getByTestId('menu-song-list').click();

        await expect(await remoteMic.getByTestId('zzz-last-polish-1994.json')).toBeVisible();
    });
    await test.step('Song list doesnt contain removed songs after connecting and contains new ones', async () => {
        await remoteMic.getByTestId('menu-microphone').click();
        await connectRemoteMic(remoteMic);

        await page.getByTestId('save-button').click();
        await page.getByTestId('manage-songs').click();
        await page.getByTestId('edit-songs').click();
        await page.locator('[data-test="hide-song"][data-song="zzz-last-polish-1994.json"]').click();
        await expect(
            await page.locator('[data-test="restore-song"][data-song="zzz-last-polish-1994.json"]'),
        ).toBeVisible();
        await page.getByTestId('convert-song').click();
        await page.getByTestId('input-txt').fill(txtfile);
        await page.getByTestId('next-button').click();
        await page.locator('[data-test="video-url"] input').fill(`https://www.youtube.com/watch?v=8YKAHgwLEMg`);
        await page.getByTestId('next-button').click();
        await page.getByTestId('next-button').click();
        await page.getByTestId('save-button').click();
        await expect(await page.getByTestId('convert-song')).toBeVisible();

        await remoteMic.getByTestId('menu-song-list').click();
        await expect(await remoteMic.getByTestId('zzz-last-polish-1994.json')).not.toBeVisible();
        await expect(await remoteMic.getByTestId('convert-test.json')).toBeVisible();
    });
});
