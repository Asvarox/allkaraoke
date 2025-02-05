import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import { connectRemoteMic, openAndConnectRemoteMicDirectly } from './steps/openAndConnectRemoteMic';

import initialise from './PageObjects/initialise';
import { RemoteMicPages } from './PageObjects/RemoteMic/initialiseRemoteMic';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test('Should properly manage remote mics permission settings', async ({ page, browser }) => {
  const playerName = 'E2E Test Blue';
  let remoteMic: RemoteMicPages;

  await test.step('Go to remoteMic settings', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToSetting();
    await pages.settingsPage.openRemoteMicSettings();
  });

  await test.step('Sets and remembers default permission', async () => {
    await pages.settingsPage.expectDefaultPermissionToBeWrite();
    await pages.settingsPage.toggleDefaultPermission();
    await pages.settingsPage.expectDefaultPermissionToBeRead();
    await page.reload();
    await pages.settingsPage.expectDefaultPermissionToBeRead();
  });

  await test.step('Connect remoteMic to the game', async () => {
    await pages.settingsPage.toolbar.quickConnectPhone();
    remoteMic = await openAndConnectRemoteMicDirectly(page, browser, playerName);
    await pages.settingsPage.toolbar.closeQuickConnectPhone();
  });

  await test.step('Newly connected phone gets default permission', async () => {
    await pages.settingsPage.expectDefaultPermissionToBeRead();
    await pages.settingsPage.expectConnectedDevicePermissionToBeRead();

    await expect(remoteMic.remoteMicMainPage.noPermissionsToControlTheGameAlert).toBeVisible();
    await expect(remoteMic.remoteMicMainPage.remoteKeyboardElement).not.toBeVisible();
    await expect(remoteMic.remoteMicMainPage.joinGameButton).not.toBeVisible();
    await remoteMic.remoteMicMainPage.remoteTabBar.goToSettings();
    await expect(remoteMic.remoteMicSettingsPage.manageGameButton).not.toBeVisible();
  });

  await test.step('Write access allows for keyboard and change player', async () => {
    await pages.settingsPage.toggleConnectedDevicePermission();
    await pages.settingsPage.expectConnectedDevicePermissionToBeWrite();

    await expect(remoteMic.remoteMicSettingsPage.manageGameButton).toBeVisible();
    await remoteMic.remoteMicSettingsPage.remoteTabBar.goToMicMainPage();
    await expect(remoteMic.remoteMicMainPage.noPermissionsToControlTheGameAlert).not.toBeVisible();
    await expect(remoteMic.remoteMicMainPage.remoteKeyboardElement).toBeVisible();
    await expect(remoteMic.remoteMicMainPage.joinGameButton).toBeVisible();
  });

  await test.step('Selected permission is persisted for the remote mic', async () => {
    await remoteMic._page.reload();
    await connectRemoteMic(remoteMic._page);

    await expect(remoteMic.remoteMicMainPage.noPermissionsToControlTheGameAlert).not.toBeVisible();
    await expect(remoteMic.remoteMicMainPage.remoteKeyboardElement).toBeVisible();
    await expect(remoteMic.remoteMicMainPage.joinGameButton).toBeVisible();
  });
});
