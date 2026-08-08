import { Browser, BrowserContextOptions } from '@playwright/test';

import { initTestMode, mockSongs } from '../helpers';

/**
 * A second singer on their own browser context — separate storage (so their name/calibration are
 * their own) but the same mocked song list and test mode as the main page. Returns the bare page;
 * wrap it with `initialise()` (or `initialiseRemoteMic()`) for the page objects.
 */
export async function newPlayerPage(browser: Browser, options?: BrowserContextOptions) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  await initTestMode({ page, context });
  await mockSongs({ page, context });

  return page;
}
