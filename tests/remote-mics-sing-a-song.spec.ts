import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import {
  connectRemoteMic,
  openAndConnectRemoteMicDirectly,
  openAndConnectRemoteMicWithCode,
} from './steps/openAndConnectRemoteMic';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

// Service worker caches index.json which breaks playwright's request intercept (mocking of song list)
// Not disabling it globally so in case SW breaks the app it is caught by other tests
test.use({ serviceWorkers: 'block' });

const P1_Name = 'E2E Test Blue';
const P2_Name = 'E2E Test Red';
const blueMicNum = 0;
const redMicNum = 1;
const song1 = 'e2e-multitrack-polish-1994';
const song2 = 'e2e-skip-intro-polish';
const songTitle = 'Skip Intro song';

test('Remote mic should connect, be selectable and control the game', async ({
  browser,
  page,
  context,
  browserName,
}) => {
  test.fixme(browserName === 'firefox', 'Test fails super often on FF');
  test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  // Connect microphones
  const remoteMicBluePage = await openAndConnectRemoteMicWithCode(page, browser, P1_Name);
  const remoteMicRed = await openAndConnectRemoteMicDirectly(page, browser, P2_Name);

  await test.step('Assert auto selection of inputs', async () => {
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(blueMicNum, P1_Name);
    await pages.smartphonesConnectionPage.expectPlayerNameToBe(redMicNum, P2_Name);
  });

  await test.step('Navigate to main menu by phone', async () => {
    await pages.smartphonesConnectionPage.navigateToMainMenuWithKeyboard(remoteMicBluePage._page);
    await remoteMicBluePage._page.getByTestId('keyboard-enter').click();
    await expect(pages.mainMenuPage.singSongElement).toBeVisible();
  });

  await test.step('Check if the remote mics reconnect automatically', async () => {
    await page.waitForTimeout(500);
    await page.reload();

    await expect(remoteMicBluePage._page.getByTestId('connect-button')).toContainText('Connected', {
      ignoreCase: true,
    });
    await expect(remoteMicRed._page.getByTestId('connect-button')).toContainText('Connected', {
      ignoreCase: true,
    });

    await Promise.race([
      pages.smartphonesConnectionPage.expectConnectedAlertToBeShownForPlayer(P1_Name),
      pages.smartphonesConnectionPage.expectConnectedAlertToBeShownForPlayer(P2_Name),
    ]);
  });

  await test.step('Navigate to song list by phone', async () => {
    await pages.mainMenuPage.navigateToSongListWithKeyboard(remoteMicBluePage._page);
    await remoteMicBluePage._page.getByTestId('keyboard-enter').click();
    await pages.songLanguagesPage.navigateToSongListWithKeyboard(remoteMicBluePage._page);
    await remoteMicBluePage._page.getByTestId('keyboard-enter').click();
  });

  await test.step('Search song remotely and navigate', async () => {
    await remoteMicBluePage._page.getByTestId('search-song-input').fill(songTitle);
    await expect(await pages.songListPage.getSongElement(song1)).not.toBeVisible();
    await expect(await pages.songListPage.getSongElement(song2)).toBeVisible();

    await pages.songListPage.focusSong(song2);
    await remoteMicBluePage._page.getByTestId('keyboard-enter').click();
    await pages.songPreviewPage.navigateToGoNextWithKeyboard(remoteMicRed._page);
    await remoteMicRed._page.getByTestId('keyboard-enter').click();
  });

  await test.step('Check if the mics are reselected after they refresh', async () => {
    // Blue microphone
    await remoteMicBluePage._page.reload();
    await expect(pages.songPreviewPage.getUnavailableStatusPlayer(blueMicNum)).toBeVisible();
    await remoteMicBluePage._page.getByTestId('player-name-input').fill(P1_Name);
    await connectRemoteMic(remoteMicBluePage._page);
    await expect(remoteMicBluePage._page.getByTestId('indicator')).toHaveAttribute('data-player-number', '0');
    await expect(pages.songPreviewPage.getUnavailableStatusPlayer(blueMicNum)).not.toBeVisible();
    await pages.songPreviewPage.expectConnectedAlertToBeShownForPlayer(P1_Name);

    // Red microphone
    await remoteMicRed._page.reload();
    await expect(pages.songPreviewPage.getUnavailableStatusPlayer(redMicNum)).toBeVisible();
    await remoteMicRed._page.getByTestId('player-name-input').fill(P2_Name);
    await connectRemoteMic(remoteMicRed._page);
    await expect(remoteMicRed._page.getByTestId('indicator')).toHaveAttribute('data-player-number', '1');
    await expect(pages.songPreviewPage.getUnavailableStatusPlayer(redMicNum)).not.toBeVisible();
    await pages.songPreviewPage.expectConnectedAlertToBeShownForPlayer(P2_Name);

    await pages.songPreviewPage.navigateToPlayTheSongWithKeyboard(remoteMicRed._page);
    await remoteMicRed._page.getByTestId('keyboard-enter').click();
  });

  await test.step('Expect confirmation status from players', async () => {
    await remoteMicBluePage._page.getByTestId('ready-button').click();
    await pages.songPreviewPage.expectPlayerConfirmationStatusToBe(P1_Name);
    await remoteMicRed._page.getByTestId('ready-button').click();
    await pages.songPreviewPage.expectPlayerConfirmationStatusToBe(P2_Name);
  });

  await test.step('Check if restart song is possible', async () => {
    await expect(pages.gamePage.getSongLyricsForPlayerElement(blueMicNum)).toBeVisible({ timeout: 10_000 });
    await expect(remoteMicBluePage._page.getByTestId('keyboard-enter')).not.toBeDisabled();

    await remoteMicBluePage._page.getByTestId('keyboard-backspace').click();
    await expect(pages.gamePage.restartButton).toBeVisible();
    await pages.gamePage.navigateToRestartSongWithKeyboard(remoteMicRed._page);
    await remoteMicRed._page.getByTestId('keyboard-enter').click();
  });

  await test.step('Play song', async () => {
    await page.waitForTimeout(500);
    await remoteMicBluePage._page.getByTestId('ready-button').click();
    await pages.songPreviewPage.expectPlayerConfirmationStatusToBe(P1_Name);
    await remoteMicRed._page.getByTestId('ready-button').click();
    await pages.songPreviewPage.expectPlayerConfirmationStatusToBe(P2_Name);

    await expect(pages.gamePage.skipIntroElement).toBeVisible();
    await page.waitForTimeout(1500);
    await remoteMicRed._page.getByTestId('keyboard-enter').click();
  });

  test.fixme(browserName === 'firefox', 'Remote mics dont get any microphone input on FF :(');

  await test.step('Check if players names are displayed in results', async () => {
    await expect(pages.postGameResultsPage.skipScoreElement).toBeVisible({ timeout: 15_000 });
    await pages.postGameResultsPage.waitForPlayersScoreToBeGreaterThan(100);
    await pages.postGameResultsPage.expectPlayerNameToBeDisplayed(blueMicNum, P1_Name);
    await pages.postGameResultsPage.expectPlayerNameToBeDisplayed(redMicNum, P2_Name);
  });

  await test.step('Go to select new song', async () => {
    await expect(pages.postGameResultsPage.skipScoreElement).toBeVisible();
    await remoteMicBluePage._page.getByTestId('keyboard-enter').click();
    await expect(pages.postGameResultsPage.nextButton).toBeVisible();
    await remoteMicBluePage._page.getByTestId('keyboard-enter').click();
    await expect(pages.postGameHighScoresPage.selectSongButton).toBeVisible();
    await remoteMicBluePage._page.getByTestId('keyboard-enter').click();
    await expect(await pages.songListPage.getSongElement(song2)).toBeVisible();
  });
});
