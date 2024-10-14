import { expect, test } from '@playwright/test';
import initialise from './PageObjects/initialise';
import { initTestMode, mockSongs } from './helpers';
import { openRemoteMic } from './steps/openAndConnectRemoteMic';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test('reset user microphone works well', async ({ page, browser, context }) => {
  const playerName = 'Player 1';

  await page.goto('/?e2e-test');

  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic = await openRemoteMic(page, context, browser);

  await remoteMic.remoteMicMainPage.enterPlayerName(playerName);

  const gameCodeValue = await remoteMic.remoteMicMainPage.gameCodeInput.getAttribute('value');

  await remoteMic.remoteMicMainPage.clickToConnectMic();
  await remoteMic.remoteMicMainPage.goToSettings();
  await remoteMic.remoteMicSettingsPage.goToMicSettings();
  //save remote-mic-ID here and compare both after reset mic
  await expect(remoteMic.remoteMicSettingsPage.resetMicInfo).toBeVisible();
  await remoteMic.remoteMicSettingsPage.resetMicrophone();

  await remoteMic.remoteMicMainPage.expectGameCodeToBe(gameCodeValue!);
  await expect(remoteMic.remoteMicMainPage.playerNameInput).toBeEmpty();
});
