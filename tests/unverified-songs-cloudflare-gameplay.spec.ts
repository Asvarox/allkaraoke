import { expect, test } from '@playwright/test';
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
  await context.addInitScript(() => {
    window.confirm = () => true;
  });
});

test.use({ serviceWorkers: 'block' });

test('unverified song can transition from Song Selection to active gameplay', async ({ page, request }) => {
  test.slow();

  await test.step('Upsert unverified song fixture into local Cloudflare storage', async () => {
    await upsertCloudflareUnverifiedSongFixture(request);
  });

  await page.goto('/?e2e-test');

  await pages.landingPage.enterTheGame();
  await pages.mainMenuPage.goToInputSelectionPage();
  await pages.inputSelectionPage.selectComputersMicrophone();
  await pages.computersMicConnectionPage.goToMainMenu();

  await pages.mainMenuPage.goToSingSong();
  await pages.songLanguagesPage.ensureSongLanguageIsSelected('English');
  await pages.songLanguagesPage.continueAndGoToSongList();

  await pages.songListPage.searchSong(unverifiedSong.title);

  await pages.songListPage.expectUnverifiedSongsGroupToBeVisible();
  await pages.songListPage.expectUnverifiedSongCardToBeVisible(unverifiedSong.id);
  await pages.songListPage.expectSelectedSongToBe(unverifiedSong.id);
  await pages.songListPage.songPreviewElement.click();
  await pages.songPreviewPage.goToInputSelectionPage();
  await pages.computersMicConnectionPage.continueToTheSong();
  await pages.songPreviewPage.goNext();
  await pages.songPreviewPage.playTheSong(true, true, true);

  await expect(pages.gamePage.getPlayerScoreElement(0)).toBeVisible({ timeout: 30000 });
});
