import { test } from '@playwright/test';

import { initTestMode } from './helpers';
import initialise from './page-objects/initialise';
import { upsertCloudflareUnverifiedSongFixture } from './unverified-songs-cloudflare-fixture';

const unverifiedSong = {
  id: 'shared-cloudflare-e2e-song',
  title: 'Cloudflare Shared Unique Song',
  artist: 'Cloudflare Artist',
};

let pages: ReturnType<typeof initialise>;

test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
});

test.use({ serviceWorkers: 'block' });

test('unverified song fixture is upserted, searchable, and loadable in edit route', async ({ page, request }) => {
  test.slow();

  await test.step('Upsert unverified song fixture into local Cloudflare storage', async () => {
    await upsertCloudflareUnverifiedSongFixture(request);
  });

  await page.goto('/?e2e-test');

  await test.step('Find upserted unverified song in Song Selection fallback group', async () => {
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected('English');
    await pages.songLanguagesPage.continueAndGoToSongList();

    await pages.songListPage.searchSong(unverifiedSong.title);
    await pages.songListPage.expectUnverifiedSongsGroupToBeVisible();
    await pages.songListPage.expectUnverifiedSongCardToBeVisible(unverifiedSong.id);
  });

  await test.step('Open edit screen with externalSong param and verify shared song loaded', async () => {
    await page.goto(`/edit/song/?externalSong=${unverifiedSong.id}&e2e-test`);
    await pages.songEditBasicInfoPage.expectEditedSongHeaderToBe(unverifiedSong.artist, unverifiedSong.title);
  });
});
