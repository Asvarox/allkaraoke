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

test('Should properly reset data settings', async ({ browser, page }) => {
  const name = 'E2E Test Blue';

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, name);

  await remoteMic._page.reload();
  await remoteMic.remoteMicMainPage.expectPlayerNameToBe(name);
  await remoteMic.remoteMicMainPage.goToSettings();
  await remoteMic.remoteMicSettingsPage.goToMicrophoneSettings();

  const remoteMicID = await remoteMic.remoteMicSettingsPage.remoteMicID.textContent();

  await remoteMic.remoteMicSettingsPage.resetMicrophone();
  await remoteMic.remoteMicMainPage.expectPlayerNameToBe('');
  await remoteMic.remoteMicMainPage.goToSettings();
  await expect(remoteMic.remoteMicSettingsPage.remoteMicID).not.toContainText(remoteMicID!);
});

test('Should allow changing microphone input lag', async ({ browser, page, context }) => {
  const numericInputValue = '25';

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');

  await test.step('changing microphone lag is visible', async () => {
    await remoteMic.remoteMicMainPage.goToSettings();
    await remoteMic.remoteMicSettingsPage.goToMicrophoneSettings();
    await remoteMic.remoteMicSettingsPage.increaseMicInputDelay();
    await remoteMic.remoteMicSettingsPage.expectMicInputDelayToBe(numericInputValue);
  });

  await test.step('the change is preserved after reload', async () => {
    await remoteMic._page.reload();
    await connectRemoteMic(remoteMic._page);

    await remoteMic.remoteMicMainPage.goToSettings();
    await remoteMic.remoteMicSettingsPage.goToMicrophoneSettings();
    await remoteMic.remoteMicSettingsPage.expectMicInputDelayToBe(numericInputValue);
  });
});

test('Should properly manage mics', async ({ browser, page, context }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await page.getByTestId('remote-mics').click();

  const remoteMic1 = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');
  const remoteMic2 = await openAndConnectRemoteMicDirectly(page, browser, 'Player 2');
  await expect(remoteMic2._page.getByTestId('indicator')).toHaveAttribute('data-player-number', '1');

  await test.step('Changes other players number', async () => {
    await remoteMic1._page.getByTestId('menu-settings').click();
    await remoteMic1._page.getByTestId('manage-game').click();
    await remoteMic1._page.getByText('Player 2').click();
    await remoteMic1._page.getByTestId('change-to-unset').click();
    await expect(remoteMic2._page.getByTestId('indicator')).toHaveAttribute('data-player-number', 'none');
  });

  await test.step('Can still assign players after refresh', async () => {
    await remoteMic1._page.reload();
    await connectRemoteMic(remoteMic1._page);

    await remoteMic1._page.getByTestId('menu-settings').click();
    await remoteMic1._page.getByTestId('manage-game').click();
    await remoteMic1._page.getByText('Player 2').click();
    await remoteMic1._page.getByTestId('change-to-player-0').click();
    await expect(remoteMic2._page.getByTestId('indicator')).toHaveAttribute('data-player-number', '0');
    await remoteMic1._page.getByTestId('close-modal').click();
    await remoteMic1._page.getByTestId('menu-microphone').click();
    await expect(remoteMic1._page.getByTestId('indicator')).toHaveAttribute('data-player-number', '2');
  });
});

test('Should allow changing game input lag', async ({ browser, page, context }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await page.getByTestId('remote-mics').click();

  const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');

  await page.getByTestId('save-button').click();
  await page.getByTestId('settings').click();

  await test.step('changing input lag is visible', async () => {
    await remoteMic._page.getByTestId('menu-settings').click();
    await remoteMic._page.getByTestId('manage-game').click();
    await remoteMic._page.getByTestId('game-input-lag').getByTestId('numeric-input-up').click();
    await expect(remoteMic._page.getByTestId('game-input-lag').getByTestId('numeric-input-value')).toContainText('50');
    await expect(page.getByTestId('input-lag')).toHaveValue('50');
  });
});
