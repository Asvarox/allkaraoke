import { Browser, BrowserContext, Page, devices, expect, test } from '@playwright/test';
import initialiseRemoteMic from '../PageObjects/RemoteMic/initialiseRemoteMic';
import initialise from '../PageObjects/initialise';
import { initTestMode, mockSongs } from '../helpers';

export async function connectRemoteMic(remoteMicPage: Page) {
  await remoteMicPage.getByTestId('connect-button').click();
  await expect(remoteMicPage.getByTestId('connect-button')).toContainText('Connected', {
    ignoreCase: true,
  });
}
export async function openRemoteMic(page: Page, context: BrowserContext, browser: Browser) {
  const remoteMic = await context.newPage();
  await mockSongs({ page: remoteMic, context });
  await initTestMode({ page: remoteMic, context });

  const serverUrl = await page.getByTestId('server-link-input').inputValue();
  await remoteMic.goto(serverUrl);
  await remoteMic.getByTestId('confirm-wifi-connection').click();

  return initialiseRemoteMic(remoteMic, context, browser);
}

export async function openAndConnectRemoteMicDirectly(page: Page, browser: Browser, name: string) {
  return test.step(`Connect remote mic ${name}`, async () => {
    const context = await browser.newContext({
      ...devices['Pixel 7'],
      // Firefox doesn't support isMobile
      isMobile: browser.browserType().name() !== 'firefox',
    });
    const remoteMic = await openRemoteMic(page, context, browser);

    await remoteMic._page.getByTestId('player-name-input').fill(name);
    await connectRemoteMic(remoteMic._page);

    return remoteMic;
  });
}

export async function openAndConnectRemoteMicWithCode(page: Page, browser: Browser, name: string) {
  return test.step(`Connect remote mic ${name} with code`, async () => {
    const context = await browser.newContext({
      ...devices['Pixel 7'],
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
    await remoteMic.getByTestId('confirm-wifi-connection').click();
    await remoteMic.getByTestId('game-code-input').fill(gameCode);

    await remoteMic.getByTestId('player-name-input').fill(name);
    await connectRemoteMic(remoteMic);

    return initialiseRemoteMic(remoteMic, context, browser);
  });
}
