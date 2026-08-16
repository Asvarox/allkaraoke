import { Browser, BrowserContext, Page } from '@playwright/test';

import initialise from '../page-objects/initialise';

/**
 * Join an already-created room by code, prefilled via the invite-link URL param, and land in its
 * lobby. Mirrors `createOnlineRoom` for the joining side.
 */
export async function joinOnlineRoom(
  page: Page,
  context: BrowserContext,
  browser: Browser,
  roomCode: string,
  name: string,
) {
  const pages = initialise(page, context, browser);

  await page.goto(`/online/?room=${roomCode}&e2e-test`);
  await pages.onlineSetupPage.submitRoomCode();
  await pages.onlineSetupPage.completeNameMicAndCalibrationSteps(name);
  await pages.onlineLobbyPage.expectToBeVisible({ timeout: 15_000 });

  return pages;
}
