import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import { connectRemoteMic, openAndConnectRemoteMicDirectly, openRemoteMic } from './steps/openAndConnectRemoteMic';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test('Should properly reset data settings', async ({ browser, page, context }) => {
  const playerName = 'E2E Test Blue';

  await test.step('Go to select smartphones setup', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.inputSelectionPage.selectSmartphones();
  });

  const remoteMic = await openRemoteMic(page, context, browser);
  const gameCodeValue = await remoteMic.remoteMicMainPage.gameCodeInput.getAttribute('value');

  await test.step('Enter player`s name and connect mic with the game', async () => {
    await remoteMic.remoteMicMainPage.enterPlayerName(playerName);
    await remoteMic.remoteMicMainPage.clickToConnectMic();
  });

  await test.step('Go to the mic settings - info about the ability to reset the mic is visible', async () => {
    await remoteMic.remoteMicMainPage.goToSettings();
    await remoteMic.remoteMicSettingsPage.goToMicSettings();
    await expect(remoteMic.remoteMicSettingsPage.resetMicInfo).toBeVisible();
  });

  const remoteMicID = await remoteMic.remoteMicSettingsPage.remoteMicID.textContent();

  await test.step('After resetting the mic settings, remoteMicID and player name should be cleared', async () => {
    await remoteMic.remoteMicSettingsPage.resetMicrophone();
    await remoteMic.remoteMicMainPage.expectPlayerNameToBe('');
    await remoteMic.remoteMicMainPage.expectGameCodeToBe(gameCodeValue!);

    await remoteMic.remoteMicMainPage.goToSettings();
    await expect(remoteMic.remoteMicSettingsPage.remoteMicID).not.toContainText(remoteMicID!);
  });
});

test('Should allow changing microphone input lag', async ({ browser, page, context }) => {
  const numericInputValue = '25';

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');

  await test.step('changing microphone lag is visible', async () => {
    await remoteMic.remoteMicMainPage.goToSettings();
    await remoteMic.remoteMicSettingsPage.goToMicSettings();

    await remoteMic.remoteMicSettingsPage.increaseMicInputLag();
    await remoteMic.remoteMicSettingsPage.expectMicInputLagToBe(numericInputValue);
  });

  await test.step('the change is preserved after reload', async () => {
    await remoteMic._page.reload();
    await connectRemoteMic(remoteMic._page);

    await remoteMic.remoteMicMainPage.goToSettings();
    await remoteMic.remoteMicSettingsPage.goToMicSettings();
    await remoteMic.remoteMicSettingsPage.expectMicInputLagToBe(numericInputValue);
  });
});

test('Should properly manage mics', async ({ browser, page, context }) => {
  const player2Name = 'Player 2';
  const blueMic = 'blue';
  const redMic = 'red';

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic1 = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');
  const remoteMic2 = await openAndConnectRemoteMicDirectly(page, browser, player2Name);

  await remoteMic2.remoteMicMainPage.expectPlayerToBeAssigned(redMic);

  await test.step('Changes other players number', async () => {
    await remoteMic1.remoteMicMainPage.goToSettings();
    await remoteMic1.remoteMicSettingsPage.goToManageGame();
    await remoteMic1.remoteMicManageGamePage.goToManagePlayer(player2Name);
    await remoteMic1.remoteMicManagePlayerPage.unassignManagedPlayer();
    await remoteMic2.remoteMicMainPage.expectPlayerToBeUnassigned();
  });

  await test.step('Can unassign players after refresh', async () => {
    await remoteMic1._page.reload();
    await connectRemoteMic(remoteMic1._page);

    await remoteMic1.remoteMicMainPage.goToSettings();
    await remoteMic1.remoteMicSettingsPage.goToManageGame();
    await remoteMic1.remoteMicManageGamePage.goToManagePlayer(player2Name);
    await remoteMic1.remoteMicManagePlayerPage.setMicAssigment(blueMic);
    await remoteMic2.remoteMicMainPage.expectPlayerToBeAssigned(blueMic);
    await remoteMic1.remoteMicManageGamePage.goBackToMicSettings();
    await remoteMic1.remoteMicSettingsPage.goToMicMainPage();
    await remoteMic1.remoteMicMainPage.expectPlayerToBeUnassigned();
  });
});

test('Should allow changing game input lag', async ({ browser, page, context }) => {
  const numericInputValue = '50';

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');

  await pages.smartphonesConnectionPage.goToMainMenu();
  await pages.mainMenuPage.goToSetting();

  await test.step('changing input lag is visible', async () => {
    await remoteMic.remoteMicMainPage.goToSettings();
    await remoteMic.remoteMicSettingsPage.goToManageGame();
    await remoteMic.remoteMicManageGamePage.increaseGameInputLag();
    await remoteMic.remoteMicManageGamePage.expectGameInputLagToBe(numericInputValue);
    await pages.settingsPage.expectInputLagToBe(numericInputValue);
  });
});
