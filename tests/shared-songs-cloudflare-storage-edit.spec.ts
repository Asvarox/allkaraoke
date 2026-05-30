import { test } from '@playwright/test';
import initialise from './PageObjects/initialise';
import { initTestMode } from './helpers';
import { upsertCloudflareSharedSongFixtureOrMock } from './sharedSongsCloudflareFixture';

const sharedSong = {
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

test('shared song fixture is upserted, searchable, and loadable in edit route', async ({ page, baseURL }) => {
  test.slow();

  await test.step('Upsert shared song fixture into local Cloudflare storage', async () => {
    await upsertCloudflareSharedSongFixtureOrMock(page, baseURL);
  });

  await page.goto('/?e2e-test');

  await test.step('Find upserted shared song in Song Selection fallback group', async () => {
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected('English');
    await pages.songLanguagesPage.continueAndGoToSongList();

    await pages.songListPage.searchSong(sharedSong.title);
    await pages.songListPage.expectUnverifiedSharedSongsGroupToBeVisible();
    await pages.songListPage.expectSharedSongCardToBeVisible(sharedSong.id);
  });

  await test.step('Open edit screen with externalSong param and verify shared song loaded', async () => {
    await page.goto(`/edit/song/?externalSong=${sharedSong.id}&e2e-test`);
    await pages.songEditBasicInfoPage.expectEditedSongHeaderToBe(sharedSong.artist, sharedSong.title);
  });
});
