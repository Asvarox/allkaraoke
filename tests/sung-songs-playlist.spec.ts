import { expect, Page, test } from '@playwright/test';

import { initTestMode, mockSongs } from './helpers';
import initialise from './page-objects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const sungSongsPlaylist = 'sung-songs';
const sungSongs = [
  'e2e-single-english-1995',
  'e2e-new-english-1995',
  'e2e-english-polish-1994',
  'e2e-multitrack-polish-1994',
  'e2e-christmas-english-1995',
];
const notSungSong = 'zzz-last-polish-1994';

const seedSungSong = (page: Page, songId: string) =>
  page.evaluate(
    (songId) =>
      window.__storeSongStats!(songId, {
        plays: 1,
        scores: [
          {
            setup: { id: `setup-${songId}`, players: [{ number: 0, track: 0 }], mode: 'DUEL', tolerance: 2 },
            scores: [{ name: 'E2E Player', score: 5000 }],
            date: new Date().toISOString(),
            progress: 1,
          },
        ],
      }),
    songId,
  );

test('Sung songs playlist appears once 5 songs were sung', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.mainMenuPage.goToSingSong();
  await pages.songLanguagesPage.continueAndGoToSongList();

  await test.step('Playlist is hidden until 5 songs are sung', async () => {
    for (const songId of sungSongs.slice(0, -1)) {
      await seedSungSong(page, songId);
    }
    await expect(pages.songListPage.getPlaylistElement('All')).toBeVisible();
    await expect(pages.songListPage.getPlaylistElement(sungSongsPlaylist)).not.toBeVisible();
  });

  await test.step('Playlist appears after the 5th sung song', async () => {
    await seedSungSong(page, sungSongs.at(-1)!);
    await expect(pages.songListPage.getPlaylistElement(sungSongsPlaylist)).toBeVisible();
  });

  await test.step('Playlist contains only the sung songs', async () => {
    await pages.songListPage.goToPlaylist(sungSongsPlaylist);
    for (const songId of sungSongs) {
      await expect(await pages.songListPage.getSongElement(songId)).toBeVisible();
    }
    await expect(await pages.songListPage.getSongElement(notSungSong, false)).not.toBeVisible();
  });
});
