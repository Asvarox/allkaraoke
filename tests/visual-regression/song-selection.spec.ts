import { expect } from '@playwright/test';

import { mockRandom, mockSongs } from '../helpers';
import { SongLanguagesPagePO } from '../page-objects/song-languages-page';
import { SongListPagePO } from '../page-objects/song-list-page';
import { visual } from './visual';

const songID = 'e2e-single-english-1995';

visual('Song selection', async ({ page, context, browser, makeScreenshot }) => {
  await mockSongs({ page, context });
  // The "Selection" playlist featured on load picks a random song - mock Math.random for a stable baseline
  await mockRandom({ page, context }, 0);

  const songLanguagesPage = new SongLanguagesPagePO(page, context, browser);
  const songListPage = new SongListPagePO(page, context, browser);

  await page.goto('/game/?e2e-test');

  // First run shows the language picker before the song list
  await songLanguagesPage.ensureAllLanguagesAreSelected();
  await songLanguagesPage.continueAndGoToSongList();

  await expect(songListPage.songListContainer).toBeVisible();
  await makeScreenshot('list');

  await songListPage.openPreviewForSong(songID);
  await expect(page.getByTestId('game-mode-setting')).toBeVisible();
  await makeScreenshot('preview');
});
