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
  await page.getByTestId('skip').click();
  await expect(page.getByTestId('sing-a-song')).toBeVisible();
  await expect(page.getByTestId('help-container')).toHaveAttribute('data-collapsed', 'false');
  await page.keyboard.press('Shift+h'); // toggle help
  await expect(page.getByTestId('help-container')).toHaveAttribute('data-collapsed', 'true');
  await page.reload();
  await expect(page.getByTestId('sing-a-song')).toBeVisible();
  await expect(page.getByTestId('help-container')).toHaveAttribute('data-collapsed', 'true');
});
