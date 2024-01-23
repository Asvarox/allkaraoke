import { expect, test } from '@playwright/test';
import initialise from './PageObjects/initialise';
import { initTestMode, mockSongs } from './helpers';
import { expectMonitoringToBeEnabled } from './steps/assertMonitoringStatus';
import { openAndConnectRemoteMicDirectly, openAndConnectRemoteMicWithCode } from './steps/openAndConnectRemoteMic';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const song1 = 'e2e-multitrack-polish-1994';
const blueMicNum = 0;
const redMicNum = 1;
const player1Name = 'E2E Test All';
const player2Name = 'E2E Test Karaoke';
const player2NameDefault = 'Player #2';

test('Source selection in sing settings', async ({ page, context, browser }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.skipToMainMenu();
  await pages.mainMenuPage.goToSingSong();
  await pages.songLanguagesPage.continueAndGoToSongList();
  await pages.songListPage.getSongElement(song1).dblclick();
  await pages.songPreviewPage.goNext();
  await pages.songPreviewPage.setupMics();
  await pages.inputSelectionPage.selectAdvancedSetup();

  // Connect microphone
  const remoteMicBlue = await openAndConnectRemoteMicDirectly(page, browser, player1Name);

  // Assert auto selection of inputs
  await pages.advancedConnectionPage.expectPlayerNameToBe(blueMicNum, player1Name);
  await pages.advancedConnectionPage.expectConnectedAlertToBeShownForPlayer(player1Name);
  await pages.advancedConnectionPage.saveAndGoToSing();
  await pages.songPreviewPage.expectEnteredPlayerNameToBePrefilledWith(blueMicNum, player1Name);

  // Make sure the microphone of new device is being monitored
  await expect(remoteMicBlue.getByTestId('monitoring-state')).toContainText('on', {
    ignoreCase: true,
  });

  // Make sure the input isn't monitored anymore if it's not in use
  await pages.songPreviewPage.setupMics();
  await pages.advancedConnectionPage.togglePlayerMicrophoneSource(blueMicNum);
  await expect(remoteMicBlue.getByTestId('monitoring-state')).toContainText('off', {
    ignoreCase: true,
  });
});

test('Source selection in in-game menu', async ({ page, context, browser }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await expect(pages.inputSelectionPage.advancedButton).toBeVisible();
  await pages.inputSelectionPage.selectAdvancedSetup();
  await pages.advancedConnectionPage.saveAndGoToSing();
  await pages.mainMenuPage.goToSingSong();
  await pages.songLanguagesPage.continueAndGoToSongList();
  await pages.songListPage.getSongElement(song1).dblclick();
  await pages.songPreviewPage.goNext();
  await pages.songPreviewPage.playTheSong();
  await pages.gamePage.waitForPlayersScoreToBeGreaterThan(100);
  await page.keyboard.press('Backspace');

  // Make sure the input isn't monitored anymore if it's not in use
  await pages.gamePage.microphonesSettings();
  await pages.advancedConnectionPage.togglePlayerMicrophoneSource(blueMicNum);
  await pages.advancedConnectionPage.saveAndGoToSing();
  await expectMonitoringToBeEnabled(page);
});

test('Source selection from remote mic', async ({ browser, context, page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  // Connect microphones
  const remoteMicBlue = await openAndConnectRemoteMicWithCode(page, browser, player1Name);
  const remoteMicRed = await openAndConnectRemoteMicDirectly(page, browser, player2Name);

  await test.step('change player2 to blue mic', async () => {
    await remoteMicRed.getByTestId('change-player').click();
    await remoteMicRed.getByTestId('change-to-player-0').click();
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(blueMicNum, player2Name);
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(redMicNum, player2NameDefault);
  });

  await test.step('change player1 to red mic', async () => {
    await remoteMicBlue.getByTestId('change-player').click();
    await remoteMicBlue.getByTestId('change-to-player-1').click();
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(blueMicNum, player2Name);
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(redMicNum, player1Name);
  });

  await test.step('Unset a player', async () => {
    await remoteMicBlue.getByTestId('change-player').click();
    await remoteMicBlue.getByTestId('change-to-unset').click();
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(redMicNum, player2NameDefault);
  });
});
