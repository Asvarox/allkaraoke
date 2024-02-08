import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import { connectRemoteMic, openAndConnectRemoteMicDirectly } from './steps/openAndConnectRemoteMic';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test('Should properly manage remote mics permission settings', async ({ page, context, browser }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
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
  const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'E2E Test Blue');
  await page.getByTestId('quick-connect-close').click();

  await test.step('newly connected phone gets default permission', async () => {
    await expect(await remoteMic._page.getByTestId('no-permissions-message')).toBeVisible();
    await expect(await remoteMic._page.getByTestId('remote-keyboard')).not.toBeVisible();
    await expect(await remoteMic._page.getByTestId('change-player')).not.toBeVisible();
    await remoteMic._page.getByTestId('menu-settings').click();
    await expect(await remoteMic._page.getByTestId('manage-game')).not.toBeVisible();
  });

  await test.step('write access allows for keyboard and change player', async () => {
    await page.getByTestId('remote-mic-entry').click();
    await expect(await remoteMic._page.getByTestId('manage-game')).toBeVisible();
    await remoteMic._page.getByTestId('menu-microphone').click();
    await expect(await remoteMic._page.getByTestId('remote-keyboard')).toBeVisible();
    await expect(await remoteMic._page.getByTestId('change-player')).toBeVisible();
  });

  await test.step('selected permission is persisted for the remote mic', async () => {
    await remoteMic._page.reload();
    await connectRemoteMic(remoteMic._page);

    await expect(await remoteMic._page.getByTestId('remote-keyboard')).toBeVisible();
    await expect(await remoteMic._page.getByTestId('change-player')).toBeVisible();
  });
});
