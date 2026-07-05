import { expect } from '@playwright/test';
import { mockSongs } from '../helpers';
import { visual } from './visual';

visual('Manage songs', async ({ page, context, makeScreenshot }) => {
  await mockSongs({ page, context });

  await page.goto('/manage-songs/?e2e-test');
  await expect(page.getByTestId('edit-songs')).toBeVisible();
  await makeScreenshot('hub');

  await page.getByTestId('edit-songs').click();
  await expect(page.locator('table tr.MuiTableRow-root').first()).toBeVisible();
  await makeScreenshot('edit-songs-list');

  // Each hub item navigates back to a different place (main menu, not the hub), so re-enter the hub every time
  await page.goto('/manage-songs/?e2e-test');
  await page.getByTestId('exclude-languages').click();
  await expect(page.locator('[data-test^="lang-"]').first()).toBeVisible();
  await makeScreenshot('exclude-languages');

  await page.goto('/manage-songs/?e2e-test');
  await page.getByTestId('edit-setlists').click();
  await expect(page.getByTestId('manage-setlists-page')).toBeVisible();
  await makeScreenshot('manage-setlists');
});
