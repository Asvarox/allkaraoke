import { test } from '@playwright/test';
import initialise from './PageObjects/initialise';
import { initTestMode, mockSongs } from './helpers';
import { openAndConnectRemoteMicDirectly } from './steps/openAndConnectRemoteMic';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test('Remove player`s mic by another player - works', async ({ page, browser }) => {
  const player1name = 'Player Blue';
  const player2 = {
    name: 'Player Red',
    num: 1,
    defaultName: 'Player #2',
  };

  await test.step('Go to select Smartphones setup', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.inputSelectionPage.selectSmartphones();
  });

  const remoteMic1 = await openAndConnectRemoteMicDirectly(page, browser, player1name);
  const remoteMic2 = await openAndConnectRemoteMicDirectly(page, browser, player2.name);

  await test.step('Make sure both players` mics are connected to the game', async () => {
    await remoteMic1.remoteMicMainPage.expectPlayerToBeConnected();
    await remoteMic2.remoteMicMainPage.expectPlayerToBeConnected();
  });

  await test.step('Go to manage players', async () => {
    await remoteMic1.remoteMicMainPage.remoteTabBar.goToSettings();
    await remoteMic1.remoteMicSettingsPage.goToManageGame();
    await remoteMic1.remoteMicManageGamePage.goToManagePlayer(player2.name);
  });

  await test.step('Once player2 was removed, they mic should be disconnected from the game', async () => {
    await remoteMic1.remoteMicManagePlayerPage.removePlayer();
    await remoteMic2.remoteMicMainPage.expectPlayerToBeDisconnected();
    await remoteMic2.remoteMicMainPage.expectConnectButtonToBe('disabled');
    await remoteMic2.remoteMicMainPage.expectPlayerToBeUnassigned();

    await page.reload();
    await pages.inputSelectionPage.selectSmartphones();
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(player2.num, player2.defaultName);
  });
});
