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

test('Source selection in sing settings', async ({ page, browser }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.mainMenuPage.goToSingSong();
  await pages.songLanguagesPage.continueAndGoToSongList();
  await pages.songListPage.openPreviewForSong(song1);
  await pages.songPreviewPage.goNext();
  await pages.songPreviewPage.goToInputSelectionPage();
  await pages.inputSelectionPage.selectAdvancedSetup();

  const remoteMicBlue = await openAndConnectRemoteMicDirectly(page, browser, player1Name);

  await test.step('Assert auto selection of inputs', async () => {
    await pages.advancedConnectionPage.expectPlayerNameToBe(blueMicNum, player1Name);
    await pages.advancedConnectionPage.expectConnectedAlertToBeShownForPlayer(player1Name);
    await pages.advancedConnectionPage.goToSongPreview();
    await pages.songPreviewPage.expectEnteredPlayerNameToBePrefilledWith(blueMicNum, player1Name);
    // microphone of new device is being monitored
    await expect(remoteMicBlue._page.getByTestId('monitoring-state')).toContainText('on', {
      ignoreCase: true,
    });
  });

  await test.step('Make sure the input is not monitored anymore if it is not in use', async () => {
    await pages.songPreviewPage.goToInputSelectionPage();
    await pages.advancedConnectionPage.togglePlayerMicrophoneSource(blueMicNum);
    await expect(remoteMicBlue._page.getByTestId('monitoring-state')).toContainText('off', {
      ignoreCase: true,
    });
  });
});

test('Source selection in in-game menu', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.mainMenuPage.goToInputSelectionPage();
  await expect(pages.inputSelectionPage.advancedButton).toBeVisible();
  await pages.inputSelectionPage.selectAdvancedSetup();
  await pages.advancedConnectionPage.goToMainMenu();
  await pages.mainMenuPage.goToSingSong();
  await pages.songLanguagesPage.continueAndGoToSongList();

  await test.step('Play the song', async () => {
    await pages.songListPage.openPreviewForSong(song1);
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.playTheSong();
    await pages.gamePage.waitForPlayersScoreToBeGreaterThan(100);
  });

  await test.step('Changing input is possible in-game', async () => {
    await page.keyboard.press('Backspace');
    await pages.gamePage.microphonesSettings();
    await pages.advancedConnectionPage.togglePlayerMicrophoneSource(blueMicNum);
    await pages.advancedConnectionPage.goToSongPreview();
    await expectMonitoringToBeEnabled(page);
  });
});

test('Source selection from remote mic', async ({ browser, page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.mainMenuPage.goToInputSelectionPage();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMicBlue = await openAndConnectRemoteMicWithCode(page, browser, player1Name);
  const remoteMicRed = await openAndConnectRemoteMicDirectly(page, browser, player2Name);

  await test.step('Change player2 to blue mic', async () => {
    await remoteMicRed._page.getByTestId('change-player').click();
    await remoteMicRed._page.getByTestId('change-to-player-0').click();
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(blueMicNum, player2Name);
    await expect(pages.smartphonesConnectionPage.getPlayerMicCheck(1)).not.toBeVisible();
  });

  await test.step('Change player1 to red mic', async () => {
    await remoteMicBlue._page.getByTestId('change-player').click();
    await remoteMicBlue._page.getByTestId('change-to-player-1').click();
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(blueMicNum, player2Name);
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(redMicNum, player1Name);
  });

  await test.step('Unset a player', async () => {
    await remoteMicBlue._page.getByTestId('change-player').click();
    await remoteMicBlue._page.getByTestId('change-to-unset').click();
    await expect(pages.smartphonesConnectionPage.getPlayerMicCheck(1)).not.toBeVisible();
  });
});
