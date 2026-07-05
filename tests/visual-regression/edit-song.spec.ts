import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from '../helpers';
import { visual } from './visual';

// Service worker caches index.json which breaks playwright's request intercept (mocking of song list)
test.use({ serviceWorkers: 'block' });

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
  await makeScreenshot('metadata');
});
