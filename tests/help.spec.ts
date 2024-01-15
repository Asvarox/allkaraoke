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
  await expect(pages.mainMenuPage.helpContainerElement).toBeVisible();

  await pages.mainMenuPage.helpContainerElement.click();
  await expect(pages.mainMenuPage.helpContainerElement).toBeHidden();

  await page.reload();
  await expect(pages.mainMenuPage.singSongElement).toBeVisible();
  await expect(pages.mainMenuPage.helpContainerElement).toBeHidden();

  await pages.mainMenuPage.toggleHelp();
  await expect(pages.mainMenuPage.helpContainerElement).toBeVisible();

  await page.keyboard.press('Shift+h'); // toggle help
  await expect(pages.mainMenuPage.helpContainerElement).toBeHidden();
});
