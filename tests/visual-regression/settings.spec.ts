import { expect } from '@playwright/test';

import { visual } from './visual';

visual('Settings', async ({ page, makeScreenshot }) => {
  await page.goto('/settings/?e2e-test');
  await expect(page.getByTestId('calibration-settings')).toBeVisible();
  await makeScreenshot('main');

  await page.getByTestId('remote-mics-settings').click();
  await expect(page.getByTestId('back-button')).toBeVisible();
  await makeScreenshot('remote-mics');
  await page.getByTestId('back-button').click();

  await page.getByTestId('calibration-settings').click();
  await expect(page.getByTestId('input-lag-value')).toBeVisible();
  await makeScreenshot('calibration');
});
