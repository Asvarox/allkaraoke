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
// not using devices[] as it doesn't work with firefox
test.use({ viewport: { width: 740, height: 360 }, hasTouch: true, userAgent: 'android mobile' }); // Samsung S8+

test('Mobile phone mode should be dismissible', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.landingPage.dismissMobileModePrompt();
  await expect(pages.inputSelectionPage.multipleMicButton).toBeVisible(); // Multiple Mics is hidden when in Mobile Mode
});

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

const songID = 'e2e-skip-intro-polish';

test('Mobile phone mode should be playable', async ({ browser, page, browserName }) => {
  let remoteMic1: RemoteMicPages;
  let remoteMic2: RemoteMicPages;

  test.fixme(browserName === 'firefox', 'Test fails super often on FF');
  test.slow();

  await test.step('Select enable mobile phone mode', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.landingPage.enableMobilePhoneMode();
    await expect(pages.inputSelectionPage.multipleMicButton).not.toBeVisible();
  });

  await test.step('Select Smartphones setup', async () => {
    await pages.inputSelectionPage.selectSmartphones();
  });

  await test.step('Connect remoteMics - after entering players names, they should be visible properly in inputs', async () => {
    remoteMic1 = await openAndConnectRemoteMicWithCode(page, browser, player1.name);
    remoteMic2 = await openAndConnectRemoteMicDirectly(page, browser, player2.name);
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(player1.num, player1.name);
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(player2.num, player2.name);
  });

  await test.step('Navigate to main menu with the keyboard - save setup with remoteMic', async () => {
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
  });

  await test.step('Check if the mics are reselected after they refresh', async () => {
    await remoteMic1._page.reload();
    await remoteMic1.remoteMicMainPage.enterPlayerName(player1.name);
    await connectRemoteMic(remoteMic1._page);
    await remoteMic1.remoteMicMainPage.expectPlayerToBeAssigned(player1.micColor);

    await remoteMic2._page.reload();
    await remoteMic2.remoteMicMainPage.enterPlayerName(player2.name);
    await connectRemoteMic(remoteMic2._page);
    await remoteMic2.remoteMicMainPage.expectPlayerToBeAssigned(player2.micColor);
  });

  await test.step('Start singing a song', async () => {
    await pages.mainMenuPage.navigateToSongListWithKeyboard(remoteMic1._page);
    await remoteMic1.remoteMicMainPage.pressEnterOnRemoteMic();
    await pages.songLanguagesPage.navigateToSongListWithKeyboard(remoteMic1._page);
    await remoteMic1.remoteMicMainPage.pressEnterOnRemoteMic();
    await page.waitForTimeout(500); // let the list with virtualization load
    await pages.songListPage.ensureSongToBeSelected(songID);
    await remoteMic1.remoteMicMainPage.pressEnterOnRemoteMic();
    await pages.songPreviewPage.navigateToGoNextWithKeyboard(remoteMic2._page);
    await pages.songPreviewPage.navigateToPlayTheSongWithKeyboard(remoteMic2._page);
    await pages.calibration.approveDefaultCalibrationSetting();
  });

  await test.step('Check if skip intro is possible', async () => {
    await remoteMic1.remoteMicMainPage.pressReadyOnRemoteMic();
    await remoteMic2.remoteMicMainPage.pressReadyOnRemoteMic();
    await expect(remoteMic2.remoteMicMainPage.enterKeyboardButton).not.toBeDisabled({ timeout: 8_000 });
    await page.waitForTimeout(500);
    await remoteMic2.remoteMicMainPage.pressEnterOnRemoteMic();
    await expect(pages.postGameResultsPage.skipScoreElement).toBeVisible({ timeout: 15_000 });
  });

  test.fixme(browserName === 'firefox', 'Remote mics dont get any microphone input on FF :(');
  await test.step('Once the song is finished, the player`s names should be visible on results', async () => {
    await pages.postGameResultsPage.waitForPlayersScoreToBeGreaterThan(100);
    await pages.postGameResultsPage.expectPlayerNameToBeDisplayed(player1.num, player1.name);
    await pages.postGameResultsPage.expectPlayerNameToBeDisplayed(player2.num, player2.name);
  });

  await test.step('User can select next song', async () => {
    await expect(pages.postGameResultsPage.skipScoreElement).toBeVisible();
    await remoteMic1.remoteMicMainPage.pressEnterOnRemoteMic();
    await expect(pages.postGameResultsPage.nextButton).toBeVisible();
    await remoteMic1.remoteMicMainPage.pressEnterOnRemoteMic();
    await expect(pages.postGameHighScoresPage.selectSongButton).toBeVisible();
    await remoteMic1.remoteMicMainPage.pressEnterOnRemoteMic();
    await expect(await pages.songListPage.getSongElement(songID)).toBeVisible();
  });
});
