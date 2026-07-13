import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from '../helpers';
import initialise from '../page-objects/initialise';
import { connectRemoteMic } from '../steps/open-and-connect-remote-mic';
import { REMOTE_MIC_VIEWPORTS, visual } from './visual';

visual('Landing page', async ({ page, makeScreenshot }) => {
  await page.goto('/?e2e-test');
  await expect(page.getByTestId('enter-the-game').and(page.locator(':visible'))).toBeVisible();

  await makeScreenshot();
});

visual('Main menu', async ({ page, makeScreenshot }) => {
  // Navigating directly (rather than clicking through the landing page) avoids the landing page's
  // viewport-dependent CTA, which on narrow viewports leads to quick-setup instead of the main menu.
  await page.goto('/menu/?e2e-test');
  await expect(page.getByTestId('sing-a-song')).toBeVisible();

  await makeScreenshot();
});

visual('History', async ({ page, makeScreenshot }) => {
  await page.goto('/menu/?e2e-test');
  await page.getByTestId('history').click();
  await expect(page.getByTestId('history-page')).toBeVisible();

  await makeScreenshot();
});

visual('Remote mic', REMOTE_MIC_VIEWPORTS, async ({ page, context, makeScreenshot }) => {
  await mockSongs({ page, context });

  await page.goto('/remote-mic/?e2e-test');
  await expect(page.getByTestId('game-code-input')).toBeVisible();
  await makeScreenshot('connect');

  await page.getByTestId('menu-song-list').click();
  await expect(page.getByTestId('all-songs-button')).toBeVisible();
  await makeScreenshot('song-list');

  await page.getByTestId('menu-settings').click();
  await expect(page.getByTestId('remote-mic-id')).toBeVisible();
  await makeScreenshot('settings');
});

// Mirrored keyboard: when the host is on an in-game screen that opts into mirroring (Options here),
// the connected remote renders that screen's controls directly. Needs a live host↔remote connection,
// so `page` is the remote mic (harness applies the mobile viewport) and the host runs in its own context.
visual('Remote mic mirrored keyboard', REMOTE_MIC_VIEWPORTS, async ({ page, context, browser, makeScreenshot }) => {
  const hostContext = await browser.newContext({
    baseURL: test.info().project.use.baseURL,
    ignoreHTTPSErrors: true,
    permissions: ['microphone'],
  });
  const host = await hostContext.newPage();
  await initTestMode({ page: host, context: hostContext });
  await mockSongs({ page: host, context: hostContext });
  const hostPages = initialise(host, hostContext, browser);

  await host.goto('/?e2e-test');
  await hostPages.landingPage.enterTheGame();
  await hostPages.mainMenuPage.goToInputSelectionPage();
  await hostPages.inputSelectionPage.selectSmartphones();

  // Connect the remote mic (this page) to the host.
  await mockSongs({ page, context });
  await initTestMode({ page, context });
  const serverUrl = await host.getByTestId('server-link-input').inputValue();
  await page.goto(serverUrl);
  await page.getByTestId('player-name-input').fill('Player 1');
  await connectRemoteMic(page);

  // Host opens the in-game Options screen, which publishes the mirrored layout to the remote.
  await hostPages.smartphonesConnectionPage.goToMainMenu();
  await hostPages.mainMenuPage.goToSetting();

  await expect(page.getByTestId('remote-keyboard')).toHaveAttribute('data-mode', 'mirror');
  await expect(page.getByTestId('control-graphics-level')).toBeVisible();

  // Mask the live ping counter in the top bar so the screenshot stays deterministic.
  await makeScreenshot(undefined, [page.getByTestId('connection-status')]);

  await hostContext.close();
});
