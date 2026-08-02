import { expect, test } from '@playwright/test';

import { initTestMode } from './helpers';
import initialise from './page-objects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
});

test('Help', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  // The main menu and most setup/settings screens are mirrored remote-mic keyboards (no classic
  // arrow/accept hints to show), so the on-screen help indicator is exercised on History, which
  // still uses classic keyboard navigation.
  await pages.mainMenuPage.goToHistory();

  await test.step('Help container is visible by default on the page if it is not turned off', async () => {
    await expect(page.getByTestId('history-page')).toBeVisible();
    await expect(pages.mainMenuPage.toolbar.helpContainerElement).toBeVisible();
  });

  await test.step('After clicking on the container, it is hidden', async () => {
    await pages.mainMenuPage.toolbar.helpContainerElement.click();
    await expect(pages.mainMenuPage.toolbar.helpContainerElement).toBeHidden();
  });

  await test.step('The setting is remembered after refresh', async () => {
    await page.reload();
    await expect(page.getByTestId('history-page')).toBeVisible();
    await expect(pages.mainMenuPage.toolbar.helpContainerElement).toBeHidden();
  });

  await test.step('The container is visible again after clicking the help-icon', async () => {
    await pages.mainMenuPage.toolbar.toggleHelp();
    await expect(pages.mainMenuPage.toolbar.helpContainerElement).toBeVisible();
  });

  await test.step('The container is hidden, when disabled with a shortcut', async () => {
    await page.keyboard.press('Shift+h');
    await expect(pages.mainMenuPage.toolbar.helpContainerElement).toBeHidden();
  });
});
