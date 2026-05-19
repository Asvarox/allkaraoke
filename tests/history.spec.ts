import { test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test('History page', async ({ page }) => {
  await page.goto('/?e2e-test');

  await test.step('Navigate from main menu to History', async () => {
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToHistory();
    await pages.historyPage.container.waitFor();
  });

  await test.step('Shows empty state when no songs have been sung', async () => {
    await pages.historyPage.emptyState.waitFor();
  });

  await test.step('Back to menu via backspace', async () => {
    await page.keyboard.press('Backspace');
    await pages.mainMenuPage.waitForContainer();
  });
});
