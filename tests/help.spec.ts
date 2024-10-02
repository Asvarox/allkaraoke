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

  await test.step('Help container is visible by default on the page if it is not turned off', async () => {
    await expect(pages.mainMenuPage.singSongElement).toBeVisible();
    await expect(pages.mainMenuPage.helpContainerElement).toBeVisible();
  });

  await test.step('After clicking on the container, it is hidden', async () => {
    await pages.mainMenuPage.helpContainerElement.click();
    await expect(pages.mainMenuPage.helpContainerElement).toBeHidden();
  });

  await test.step('The setting is remembered after refresh', async () => {
    await page.reload();
    await expect(pages.mainMenuPage.singSongElement).toBeVisible();
    await expect(pages.mainMenuPage.helpContainerElement).toBeVisible();
  });

  await test.step('The container is visible again after clicking the help-icon', async () => {
    await pages.mainMenuPage.toggleHelp();
    await expect(pages.mainMenuPage.helpContainerElement).toBeVisible();
  });

  await test.step('The container is hidden, when disabled with a shortcut', async () => {
    await page.keyboard.press('Shift+h');
    await expect(pages.mainMenuPage.helpContainerElement).toBeHidden();
  });
});
