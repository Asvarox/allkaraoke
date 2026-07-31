import { Browser, BrowserContext, devices, expect, Page, test } from '@playwright/test';

import { initTestMode, mockSongs } from '../helpers';
import initialise from '../page-objects/initialise';
import initialiseRemoteMic from '../page-objects/remote-mic/initialise-remote-mic';

export async function connectRemoteMic(remoteMicPage: Page, name?: string, closeMicSelectionMenu = true) {
  // The game code always auto-connects once fully entered (typed, pasted, or auto-revealed from a
  // preloaded URL) — no button click needed. The "Set Your Name" step, however, only shows up when
  // there's no remembered name yet (e.g. the first connection in this browser context); on a
  // reconnect with a remembered name it's skipped straight to "connected".
  const nameConfirmButton = remoteMicPage.getByTestId('confirm-name-button');
  try {
    await nameConfirmButton.waitFor({ state: 'visible', timeout: 6_000 });
  } catch {
    // Name step was skipped — nothing to confirm
  }
  if (await nameConfirmButton.isVisible()) {
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
export async function openRemoteMic(page: Page, context: BrowserContext, browser: Browser) {
  const remoteMic = await context.newPage();
  await mockSongs({ page: remoteMic, context });
  await initTestMode({ page: remoteMic, context });

  const serverUrl = await page.getByTestId('server-link-input').inputValue();
  await remoteMic.goto(serverUrl);

  // await remoteMic.getByTestId('confirm-wifi-connection').click();

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
