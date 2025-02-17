import { expect, test } from '@playwright/test';
import { RemoteMicPages } from './PageObjects/RemoteMic/initialiseRemoteMic';
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

test.beforeEach(async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
});

const songID = 'e2e-multitrack-polish-1994';

const names = {
  player1: 'E2E Test All',
  player2: 'E2E Test Karaoke',
};

const blueMic = {
  colorName: 'blue',
  num: 0,
} as const;

const redMic = {
  colorName: 'red',
  num: 1,
} as const;

test('Source selection in sing settings', async ({ page, browser }) => {
  let remoteMic: RemoteMicPages;

  await test.step('Go to open song preview', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.songListPage.openPreviewForSong(songID);
    await pages.songPreviewPage.goNext();
  });

  await test.step('Select Advanced setup', async () => {
    await pages.songPreviewPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectAdvancedSetup();
  });

  await test.step('Connect remoteMic and assert auto selection of inputs', async () => {
    remoteMic = await openAndConnectRemoteMicDirectly(page, browser, names.player1);
    await pages.advancedConnectionPage.expectPlayerNameToBe(blueMic.num, names.player1);
    await pages.advancedConnectionPage.expectConnectedAlertToBeShownForPlayer(names.player1);
    await pages.advancedConnectionPage.goToSongPreview();
    await pages.songPreviewPage.expectEnteredPlayerNameToBePrefilledWith(blueMic.num, names.player1);
    // microphone of new device is being monitored
    await remoteMic.remoteMicMainPage.expectMicInputStateToBe('on');
  });

  await test.step('Make sure the input is not monitored anymore if it is not in use', async () => {
    await pages.songPreviewPage.goToInputSelectionPage();
    await pages.advancedConnectionPage.togglePlayerMicrophoneSource(blueMic.num);
    await remoteMic.remoteMicMainPage.expectMicInputStateToBe('off');
  });
});

test('Source selection in in-game menu', async ({ page }) => {
  await test.step('Select Advanced setup', async () => {
    await pages.mainMenuPage.goToInputSelectionPage();
    await expect(pages.inputSelectionPage.advancedButton).toBeVisible();
    await pages.inputSelectionPage.selectAdvancedSetup();
    await pages.advancedConnectionPage.goToMainMenu();
  });

  await test.step('Go to play the song', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.songListPage.openPreviewForSong(songID);
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.playTheSong();
    await pages.gamePage.waitForPlayersScoreToBeGreaterThan(100);
  });

  await test.step('Changing input is possible in-game', async () => {
    await page.keyboard.press('Backspace');
    await pages.gamePage.microphonesSettings();
    await pages.advancedConnectionPage.togglePlayerMicrophoneSource(blueMic.num);
    await pages.advancedConnectionPage.goToSongPreview();
    await expectMonitoringToBeEnabled(page);
  });
});

test('Source selection from remote mic', async ({ browser, page }) => {
  let remoteMicBlue: RemoteMicPages;
  let remoteMicRed: RemoteMicPages;

  await test.step('Select Smartphones setup and connect remoteMics', async () => {
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectSmartphones();
    remoteMicBlue = await openAndConnectRemoteMicWithCode(page, browser, names.player1);
    remoteMicRed = await openAndConnectRemoteMicDirectly(page, browser, names.player2);
  });

  await test.step('Change player2 to blue mic', async () => {
    await remoteMicRed.remoteMicMainPage.joinGameButton.click();
    await remoteMicRed.remoteMicManagePlayerPage.setMicAssigment(blueMic.colorName);
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(blueMic.num, names.player2);
    await expect(pages.smartphonesConnectionPage.getPlayerMicCheck(redMic.num)).not.toBeVisible();
  });

  await test.step('Change player1 to red mic', async () => {
    await remoteMicBlue.remoteMicMainPage.joinGameButton.click();
    await remoteMicBlue.remoteMicManagePlayerPage.setMicAssigment(redMic.colorName);
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(blueMic.num, names.player2);
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(redMic.num, names.player1);
  });

  await test.step('Unset a player', async () => {
    await remoteMicBlue.remoteMicMainPage.joinGameButton.click();
    await remoteMicBlue.remoteMicManagePlayerPage.unassignManagedPlayer();
    await expect(pages.smartphonesConnectionPage.getPlayerMicCheck(redMic.num)).not.toBeVisible();
  });
});
