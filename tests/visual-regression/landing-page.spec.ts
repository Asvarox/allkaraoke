import { expect } from '@playwright/test';

import { visual } from './visual';

visual('Landing page', async ({ page }) => {
  await page.goto('/?e2e-test');

  await expect(page.getByTestId('enter-the-game').and(page.locator(':visible'))).toBeVisible();
});
