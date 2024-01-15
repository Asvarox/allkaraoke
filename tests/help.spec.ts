import { expect, test } from '@playwright/test';

import initialise from './PageObjects/initialise';
import { initTestMode } from './helpers';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
});

test('Help', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.skipToMainMenu();
  await expect(pages.mainMenuPage.singSongElement).toBeVisible();
  await pages.mainMenuPage.expectHelpContainerToBeVisible();

  await pages.mainMenuPage.helpContainerElement.click();
  await pages.mainMenuPage.expectHelpContainerToBeHidden();

  await page.reload();
  await expect(pages.mainMenuPage.singSongElement).toBeVisible();
  await pages.mainMenuPage.expectHelpContainerToBeHidden();

  await pages.mainMenuPage.toggleHelp();
  await pages.mainMenuPage.expectHelpContainerToBeVisible();

  await page.keyboard.press('Shift+h'); // toggle help
  await pages.mainMenuPage.expectHelpContainerToBeHidden();
});
