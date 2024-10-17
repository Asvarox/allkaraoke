import { expect, test } from '@playwright/test';
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
  const player1 = 'Player 1';
  const player2 = 'Player 2';

  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic1 = await openAndConnectRemoteMicDirectly(page, browser, player1);
  const remoteMic2 = await openAndConnectRemoteMicDirectly(page, browser, player2);

  await expect(remoteMic1.remoteMicMainPage.connectButton).toContainText('CONNECTED');
  await expect(remoteMic2.remoteMicMainPage.connectButton).toContainText('CONNECTED');

  await remoteMic1.remoteMicMainPage.goToSettings();
  await remoteMic1.remoteMicSettingsPage.goToManageGame();
  await remoteMic1.remoteMicManageGamePage.goToManagePlayer(player2);
  await remoteMic1.remoteMicManagePlayerPage.removePlayer();

  await expect(remoteMic2.remoteMicMainPage.connectButton).toContainText('DISCONNECTED');
  //await expect(remoteMic2.remoteMicMainPage.connectButton).toBeDisabled();
  await remoteMic2.remoteMicMainPage.expectPlayerToBeUnassigned();
});
