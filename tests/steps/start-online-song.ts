import { expect, Page } from '@playwright/test';

import initialise from '../page-objects/initialise';

type Pages = ReturnType<typeof initialise>;

/**
 * Host picks the given song and starts it, both singers ready up, and the room reaches the
 * live leaderboard — the shared setup for tests that exercise mid-song behaviour.
 */
export async function startOnlineSongAndReachLeaderboard(
  hostPage: Page,
  hostPages: Pages,
  guestPage: Page,
  song: { ID: string; language: string },
) {
  await hostPages.onlineLobbyPage.goToSongSelection();
  await hostPages.songLanguagesPage.ensureSongLanguageIsSelected(song.language);
  await hostPages.songLanguagesPage.continueAndGoToSongList();
  await hostPages.songListPage.openPreviewForSong(song.ID);
  await hostPages.songPreviewPage.goNext();
  await hostPage.getByTestId('play-song-button').click();

  await expect(hostPages.onlineLobbyPage.startSongButton).toBeVisible({ timeout: 15_000 });
  await hostPages.onlineLobbyPage.startSong();
  await hostPage.getByTestId('online-ready-button').click();
  await guestPage.getByTestId('online-ready-button').click();

  await expect(hostPage.getByTestId('online-leaderboard')).toBeVisible({ timeout: 15_000 });
}
