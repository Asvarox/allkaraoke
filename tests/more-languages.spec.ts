import { expect, test } from '@playwright/test';

import { initTestMode, mockSongs } from './helpers';
import initialise from './page-objects/initialise';

let pages: ReturnType<typeof initialise>;

test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const frenchSong = 'e2e-cote-dazur-french-1994';
const englishSong = 'e2e-single-english-1995';

test('More languages picker lets user browse excluded language', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Go to song list with French excluded', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected('English');
    await pages.songLanguagesPage.ensureSongLanguageIsSelected('Polish');
    await pages.songLanguagesPage.ensureSongLanguageIsDeselected('French');
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('French song is hidden in All playlist', async () => {
    await pages.songListPage.goToPlaylist('All');
    await expect(await pages.songListPage.getSongElement(englishSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(frenchSong, false)).not.toBeVisible();
  });

  await test.step('Open More languages picker and select French', async () => {
    await pages.songListPage.goToPlaylist('more-languages');
    await pages.songListPage.selectLanguageFromPicker('French');
  });

  await test.step('French playlist is active and shows only French songs', async () => {
    await pages.songListPage.expectPlaylistToBeSelected('language-French');
    await expect(await pages.songListPage.getSongElement(frenchSong)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(englishSong, false)).not.toBeVisible();
  });

  await test.step('Switching to another playlist reverts tab to More languages', async () => {
    await pages.songListPage.goToPlaylist('All');
    await expect(pages.songListPage.getPlaylistElement('more-languages')).toBeVisible();
    await expect(pages.songListPage.getPlaylistElement('language-French')).not.toBeVisible();
  });
});
