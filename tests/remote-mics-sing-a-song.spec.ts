import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import {
  connectRemoteMic,
  openAndConnectRemoteMicDirectly,
  openAndConnectRemoteMicWithCode,
} from './steps/openAndConnectRemoteMic';

import initialise from './PageObjects/initialise';
import { RemoteMicPages } from './PageObjects/RemoteMic/initialiseRemoteMic';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

// Service worker caches index.json which breaks playwright's request intercept (mocking of song list)
// Not disabling it globally so in case SW breaks the app it is caught by other tests
test.use({ serviceWorkers: 'block' });

const player1 = {
  name: 'E2E Test Blue',
  micColor: 'blue',
  num: 0,
} as const;

const player2 = {
  name: 'E2E Test Red',
  micColor: 'red',
  num: 1,
} as const;

const song1ID = 'e2e-multitrack-polish-1994';

const song2 = {
  ID: 'e2e-skip-intro-polish',
  title: 'Skip Intro song',
} as const;

test('Remote mic should connect, be selectable and control the game', async ({ browser, page, browserName }) => {
  let remoteMic1: RemoteMicPages;
  let remoteMic2: RemoteMicPages;

  test.fixme(browserName === 'firefox', 'Test fails super often on FF');
  test.slow();

  await test.step('Go to select Smartphones setup', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectSmartphones();
  });

  await test.step('Connect remoteMics - after entering players names, they should be visible properly in inputs', async () => {
    remoteMic1 = await openAndConnectRemoteMicWithCode(page, browser, player1.name);
    remoteMic2 = await openAndConnectRemoteMicDirectly(page, browser, player2.name);
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(player1.num, player1.name);
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(player2.num, player2.name);
  });

  await test.step('Navigate to main menu by phone', async () => {
    await pages.smartphonesConnectionPage.navigateToSaveButtonWithKeyboard(remoteMic1._page);
    await remoteMic1.remoteMicMainPage.pressEnterOnRemoteMic();
    await expect(pages.mainMenuPage.singSongButton).toBeVisible();
  });

  await test.step('Check if the remote mics reconnect automatically', async () => {
    await page.waitForTimeout(500);
    await page.reload();
    await remoteMic1.remoteMicMainPage.expectPlayerToBeConnected();
    await remoteMic2.remoteMicMainPage.expectPlayerToBeConnected();

    await Promise.race([
      pages.smartphonesConnectionPage.expectConnectedAlertToBeShownForPlayer(player1.name),
      pages.smartphonesConnectionPage.expectConnectedAlertToBeShownForPlayer(player2.name),
    ]);
    await remoteMic1.remoteMicChangeMicColorPage.goBackToMainMenu();
    await remoteMic2.remoteMicChangeMicColorPage.goBackToMainMenu();
  });

  await test.step('Navigate to song list by phone', async () => {
    await pages.mainMenuPage.navigateToSongListWithKeyboard(remoteMic1._page);
    await remoteMic1.remoteMicMainPage.pressEnterOnRemoteMic();
    await pages.songLanguagesPage.navigateToSongListWithKeyboard(remoteMic1._page);
    await remoteMic1.remoteMicMainPage.pressEnterOnRemoteMic();
  });

  await test.step('Search song remotely and navigate', async () => {
    await remoteMic1.remoteMicMainPage.searchTheSong(song2.title);
    await expect(await pages.songListPage.getSongElement(song1ID)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(song2.ID)).toBeVisible();

    await pages.songListPage.ensureSongToBeSelected(song2.ID);
    await remoteMic1.remoteMicMainPage.pressEnterOnRemoteMic();
    await pages.songPreviewPage.navigateToGoNextWithKeyboard(remoteMic2._page);
    await remoteMic2.remoteMicMainPage.pressEnterOnRemoteMic();
  });

  await test.step('Check if the mics are reselected after they refresh', async () => {
    // Blue microphone
    await remoteMic1._page.reload();
    await expect(pages.songPreviewPage.getUnavailableStatusPlayer(player1.num)).toBeVisible();
    await remoteMic1.remoteMicMainPage.enterPlayerName(player1.name);

    await connectRemoteMic(remoteMic1._page);
    await remoteMic1.remoteMicMainPage.expectPlayerToBeAssigned(player1.micColor);
    await expect(pages.songPreviewPage.getUnavailableStatusPlayer(player1.num)).not.toBeVisible();
    await pages.songPreviewPage.expectConnectedAlertToBeShownForPlayer(player1.name);

    // Red microphone
    await remoteMic2._page.reload();
    await expect(pages.songPreviewPage.getUnavailableStatusPlayer(player2.num)).toBeVisible();
    await remoteMic2.remoteMicMainPage.enterPlayerName(player2.name);

    await connectRemoteMic(remoteMic2._page);
    await remoteMic2.remoteMicMainPage.expectPlayerToBeAssigned(player2.micColor);
    await expect(pages.songPreviewPage.getUnavailableStatusPlayer(player2.num)).not.toBeVisible();
    await pages.songPreviewPage.expectConnectedAlertToBeShownForPlayer(player2.name);
    await pages.songPreviewPage.navigateToPlayTheSongWithKeyboard(remoteMic2._page);
    await pages.calibration.approveDefaultCalibrationSetting();
  });

  await test.step('Expect confirmation status from players', async () => {
    await remoteMic1.remoteMicMainPage.pressReadyOnRemoteMic();
    await pages.songPreviewPage.expectPlayerConfirmationStatusToBe(player1.name);
    await remoteMic2.remoteMicMainPage.pressReadyOnRemoteMic();
    await pages.songPreviewPage.expectPlayerConfirmationStatusToBe(player2.name);
  });

  await test.step('Check if restart song is possible', async () => {
    await expect(pages.gamePage.getSongLyricsForPlayerElement(player1.num)).toBeVisible({ timeout: 10_000 });
    await expect(remoteMic1.remoteMicMainPage.enterKeyboardButton).not.toBeDisabled();
    await remoteMic1.remoteMicMainPage.goBackByKeyboard();
    await expect(pages.gamePage.restartButton).toBeVisible();
    await pages.gamePage.navigateAndApproveWithKeyboard('button-restart-song', remoteMic2._page);
  });

  await test.step('Play song', async () => {
    await page.waitForTimeout(500);
    await remoteMic1.remoteMicMainPage.pressReadyOnRemoteMic();
    await pages.songPreviewPage.expectPlayerConfirmationStatusToBe(player1.name);
    await remoteMic2.remoteMicMainPage.pressReadyOnRemoteMic();
    await pages.songPreviewPage.expectPlayerConfirmationStatusToBe(player2.name);

    await expect(pages.gamePage.skipIntroElement).toBeVisible();
    await page.waitForTimeout(1500);
    await remoteMic2.remoteMicMainPage.pressEnterOnRemoteMic();
  });

  test.fixme(browserName === 'firefox', 'Remote mics dont get any microphone input on FF :(');

  await test.step('Check if players names are displayed in results', async () => {
    await expect(pages.postGameResultsPage.skipScoreElement).toBeVisible({ timeout: 15_000 });
    await pages.postGameResultsPage.waitForPlayersScoreToBeGreaterThan(100);
    await pages.postGameResultsPage.expectPlayerNameToBeDisplayed(player1.num, player1.name);
    await pages.postGameResultsPage.expectPlayerNameToBeDisplayed(player2.num, player2.name);
  });

  await test.step('Go to select new song', async () => {
    await expect(pages.postGameResultsPage.skipScoreElement).toBeVisible();
    await remoteMic1.remoteMicMainPage.pressEnterOnRemoteMic();
    await expect(pages.postGameResultsPage.nextButton).toBeVisible();
    await remoteMic1.remoteMicMainPage.pressEnterOnRemoteMic();
    await expect(pages.postGameHighScoresPage.selectSongButton).toBeVisible();
    await remoteMic1.remoteMicMainPage.pressEnterOnRemoteMic();
    await expect(await pages.songListPage.getSongElement(song2.ID)).toBeVisible();
  });
});
