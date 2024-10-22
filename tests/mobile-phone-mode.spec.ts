import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import navigateWithKeyboard from './steps/navigateWithKeyboard';
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
// not using devices[] as it doesn't work with firefox
test.use({ viewport: { width: 740, height: 360 }, hasTouch: true, userAgent: 'android mobile' }); // Samsung S8+

test('Mobile phone mode should be dismissible', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.landingPage.dismissAlertForSmallerScreens();
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

test('Mobile phone mode should be playable', async ({ browser, context, page, browserName }) => {
  test.fixme(browserName === 'firefox', 'Test fails super often on FF');
  test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  //await page.getByTestId('enable-mobile-mode').click();
  await pages.landingPage.enableMobilePhoneMode();
  await expect(pages.inputSelectionPage.multipleMicButton).not.toBeVisible();

  await pages.inputSelectionPage.selectSmartphones();

  // Connect microphones
  const remoteMic1 = await openAndConnectRemoteMicWithCode(page, browser, player1.name);
  const remoteMic2 = await openAndConnectRemoteMicDirectly(page, browser, player2.name);

  // Assert auto selection of inputs
  await pages.smartphonesConnectionPage.expectPlayerNameToBe(player1.num, player1.name);
  await pages.smartphonesConnectionPage.expectPlayerNameToBe(player2.num, player2.name);

  await navigateWithKeyboard(page, 'save-button', remoteMic1._page);

  //await remoteMic1._page.getByTestId('keyboard-enter').click();
  await remoteMic1.remoteMicMainPage.pressEnterByKeyboard();

  //await expect(page.getByTestId('sing-a-song')).toBeVisible();
  await expect(pages.mainMenuPage.singSongButton).toBeVisible();

  // Check if the remote mics reconnect automatically
  await page.waitForTimeout(500);
  await page.reload();

  // await expect(remoteMic1._page.getByTestId('connect-button')).toContainText('Connected', {
  //   ignoreCase: true,
  // });
  await remoteMic1.remoteMicMainPage.expectPlayerToBeConnected();

  // await expect(remoteMic2._page.getByTestId('connect-button')).toContainText('Connected', {
  //   ignoreCase: true,
  // });
  await remoteMic2.remoteMicMainPage.expectPlayerToBeConnected();

  await Promise.race([
    // expect(page.locator('.Toastify')).toContainText(`${player1.name} connected`, {
    //   ignoreCase: true,
    // }),
    pages.smartphonesConnectionPage.expectConnectedAlertToBeShownForPlayer(player1.name),

    // expect(page.locator('.Toastify')).toContainText(`${player2.name} connected`, {
    //   ignoreCase: true,
    // }),
    pages.smartphonesConnectionPage.expectConnectedAlertToBeShownForPlayer(player2.name),
  ]);

  // Check if the mics are reselected after they refresh
  await remoteMic1._page.reload();
  //await remoteMic1._page.getByTestId('player-name-input').fill(player1.name);
  await remoteMic1.remoteMicMainPage.enterPlayerName(player1.name);

  await connectRemoteMic(remoteMic1._page);
  //await expect(remoteMic1._page.getByTestId('indicator')).toHaveAttribute('data-player-number', '0');
  await remoteMic1.remoteMicMainPage.expectPlayerToBeAssigned(player1.micColor);

  await remoteMic2._page.reload();
  //await remoteMic2._page.getByTestId('player-name-input').fill(player2.name);
  await remoteMic2.remoteMicMainPage.enterPlayerName(player2.name);

  await connectRemoteMic(remoteMic2._page);
  //await expect(remoteMic2._page.getByTestId('indicator')).toHaveAttribute('data-player-number', '1');
  await remoteMic2.remoteMicMainPage.expectPlayerToBeAssigned(player2.micColor);

  await test.step('Start singing a song', async () => {
    await navigateWithKeyboard(page, 'sing-a-song', remoteMic1._page);
    await remoteMic1._page.getByTestId('keyboard-enter').click();
    await navigateWithKeyboard(page, 'close-exclude-languages', remoteMic1._page);
    await remoteMic1._page.getByTestId('keyboard-enter').click();
    await page.waitForTimeout(500); // let the list with virtualization load

    await pages.songListPage.focusSong('e2e-skip-intro-polish');
    await remoteMic1._page.getByTestId('keyboard-enter').click();

    await navigateWithKeyboard(page, 'next-step-button', remoteMic2._page);
    await remoteMic2._page.getByTestId('keyboard-enter').click();
    await navigateWithKeyboard(page, 'play-song-button', remoteMic2._page);
    await remoteMic2._page.getByTestId('keyboard-enter').click();
  });

  await test.step('Check if skip intro is possible', async () => {
    await remoteMic1._page.getByTestId('ready-button').click();
    await remoteMic2._page.getByTestId('ready-button').click();
    await expect(remoteMic2._page.getByTestId('keyboard-enter')).not.toBeDisabled({ timeout: 8_000 });
    await page.waitForTimeout(500);
    await remoteMic2._page.getByTestId('keyboard-enter').click();

    await expect(page.getByTestId('skip-animation-button')).toBeVisible({ timeout: 15_000 });
  });

  test.fixme(browserName === 'firefox', 'Remote mics dont get any microphone input on FF :(');

  await expect(async () => {
    const p1score = await page.getByTestId('player-0-score').getAttribute('data-score');

    expect(parseInt(p1score!, 10)).toBeGreaterThan(100);
  }).toPass();

  await expect(page.getByTestId('player-0-name')).toHaveText(player1.name);
  await expect(page.getByTestId('player-1-name')).toHaveText(player2.name);

  await expect(page.getByTestId('skip-animation-button')).toBeVisible();
  await remoteMic1._page.getByTestId('keyboard-enter').click();
  await expect(page.getByTestId('highscores-button')).toBeVisible();
  await remoteMic1._page.getByTestId('keyboard-enter').click();
  await expect(page.getByTestId('play-next-song-button')).toBeVisible();
  await remoteMic1._page.getByTestId('keyboard-enter').click();
  await expect(page.getByTestId('song-e2e-skip-intro-polish')).toBeVisible();
});
