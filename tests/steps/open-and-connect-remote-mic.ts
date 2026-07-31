import { Browser, BrowserContext, devices, expect, Page, test } from '@playwright/test';

import { initTestMode, mockSongs } from '../helpers';
import initialise from '../page-objects/initialise';
import initialiseRemoteMic from '../page-objects/remote-mic/initialise-remote-mic';

export async function connectRemoteMic(remoteMicPage: Page, name?: string, closeMicSelectionMenu = true) {
  const connectButton = remoteMicPage.getByTestId('connect-button');
  try {
    await expect(connectButton).toBeEnabled({ timeout: 4_000 });
    await connectButton.click();
  } catch {
    // Not on this step, or auto-connect already handled it
  }
  const hasStoredName = await remoteMicPage.evaluate(() => localStorage.getItem('remote_mic_name') !== null);
  if (!hasStoredName) {
    const nameConfirmButton = remoteMicPage.getByTestId('confirm-name-button');
    await nameConfirmButton.waitFor({ state: 'visible', timeout: 20_000 });
    if (name !== undefined) {
      await remoteMicPage.getByTestId('player-name-input').fill(name);
    }
    await nameConfirmButton.click();
  }

  await expect(remoteMicPage.getByTestId('connection-status')).toHaveText(/\d+ms/i, { timeout: 14_000 });

  if (closeMicSelectionMenu) {
    const closeButton = remoteMicPage.getByTestId('close-menu');

    try {
      await closeButton.waitFor({ state: 'visible', timeout: 2_000 });
      await closeButton.click();
    } catch {
      // The connect flow does not always open the player-change sheet.
    }
  }
}
export async function openRemoteMic(page: Page, context: BrowserContext, browser: Browser, autoConnect = true) {
  const remoteMic = await context.newPage();
  await initTestMode({ page: remoteMic, context });

  const serverUrl = await page.getByTestId('server-link-input').inputValue();
  // With auto-connect off, the code is still prefilled/revealed but the mic stays disconnected
  // until connectRemoteMic() (or a manual submit) is called — used to inspect the pre-connect state
  const url = autoConnect ? serverUrl : `${serverUrl}&autoconnect=false`;
  await remoteMic.goto(url);
  await mockSongs({ page: remoteMic, context });

  return initialiseRemoteMic(remoteMic, context, browser);
}

export async function openAndConnectRemoteMicDirectly(
  page: Page,
  browser: Browser,
  name: string,
  closeMicSelectionMenu = true,
) {
  return test.step(`Connect remote mic ${name}`, async () => {
    const context = await browser.newContext({
      ...devices['Pixel 5'],
      // Firefox doesn't support isMobile
      isMobile: browser.browserType().name() !== 'firefox',
    });
    const remoteMic = await openRemoteMic(page, context, browser);

    await connectRemoteMic(remoteMic._page, name, closeMicSelectionMenu);

    return remoteMic;
  });
}

export async function openAndConnectRemoteMicWithCode(page: Page, browser: Browser, name: string) {
  return test.step(`Connect remote mic ${name} with code`, async () => {
    const context = await browser.newContext({
      ...devices['Pixel 5'],
      // Firefox doesn't support isMobile
      isMobile: browser.browserType().name() !== 'firefox',
    });

    const remoteMic = await context.newPage();
    const pages = initialise(remoteMic, context, browser);
    await mockSongs({ page: remoteMic, context });
    await initTestMode({ page: remoteMic, context });

    const gameCode = (await page.getByTestId('game-code').textContent()) ?? '';
    await remoteMic.goto('/?e2e-test');

    await pages.landingPage.joinExistingGame();
    // await remoteMic.getByTestId('confirm-wifi-connection').click();
    await remoteMic.getByTestId('game-code-input').fill(gameCode);

    await connectRemoteMic(remoteMic, name);

    return initialiseRemoteMic(remoteMic, context, browser);
  });
}
