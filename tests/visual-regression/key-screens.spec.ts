import { expect } from '@playwright/test';

import { mockSongs } from '../helpers';
import { visual } from './visual';

visual('Landing page', async ({ page, makeScreenshot }) => {
  await page.goto('/?e2e-test');
  await expect(page.getByTestId('enter-the-game').and(page.locator(':visible'))).toBeVisible();

  await makeScreenshot();
});

visual('Main menu', async ({ page, makeScreenshot }) => {
  // Navigating directly (rather than clicking through the landing page) avoids the landing page's
  // viewport-dependent CTA, which on narrow viewports leads to quick-setup instead of the main menu.
  await page.goto('/menu/?e2e-test');
  await expect(page.getByTestId('sing-a-song')).toBeVisible();

  await makeScreenshot();
});

visual('History', async ({ page, makeScreenshot }) => {
  await page.goto('/menu/?e2e-test');
  await page.getByTestId('history').click();
  await expect(page.getByTestId('history-page')).toBeVisible();

  await makeScreenshot();
});

visual('Remote mic', async ({ page, context, makeScreenshot }) => {
  await mockSongs({ page, context });

  await page.goto('/remote-mic/?e2e-test');
  await expect(page.getByTestId('game-code-input')).toBeVisible();
  await makeScreenshot('connect');

  await page.getByTestId('menu-song-list').click();
  await expect(page.getByTestId('all-songs-button')).toBeVisible();
  await makeScreenshot('song-list');

  await page.getByTestId('menu-settings').click();
  await expect(page.getByTestId('remote-mic-id')).toBeVisible();
  await makeScreenshot('settings');
});
