import { Browser, BrowserContext, Page } from '@playwright/test';

import initialise from '../page-objects/initialise';

/**
 * Open online mode from scratch, create a room and land in its lobby. Returns the code other
 * singers join with — it only lives in the URL, so it can't be read before the lobby is up.
 */
export async function createOnlineRoom(page: Page, context: BrowserContext, browser: Browser, name: string) {
  const pages = initialise(page, context, browser);

  await pages.onlineSetupPage.goto();
  await pages.onlineSetupPage.createRoom(name);
  await pages.onlineLobbyPage.expectToBeVisible({ timeout: 15_000 });

  return pages.onlineLobbyPage.getRoomCode();
}
