import { expect } from '@playwright/test';

import { initTestMode, mockSongs } from '../helpers';
import { visual } from './visual';

const songID = 'e2e-single-english-1995';

visual('Edit song', async ({ page, context, makeScreenshot }) => {
  await initTestMode({ page, context });
  await mockSongs({ page, context });

  await page.goto(`/edit/song?song=${songID}&e2e-test`);
  await expect(page.getByTestId('basic-data')).toBeVisible();
  await makeScreenshot('basic-info');

  await page.getByTestId('next-button').click();
  await expect(page.getByTestId('author-and-vid')).toBeVisible();
  await makeScreenshot('author-and-video');

  await page.getByTestId('next-button').click();
  await expect(page.getByTestId('sync-lyrics')).toBeVisible();
  await makeScreenshot('sync-lyrics');

  await page.getByTestId('next-button').click();
  await expect(page.getByTestId('song-metadata')).toBeVisible();
  // The final volume is synced from the embedded YouTube player, real remote content (hidden too)
  await makeScreenshot('metadata', {
    extraMasks: [page.getByText(/^Final Song Volume/), page.getByTestId('volume')],
  });
});
