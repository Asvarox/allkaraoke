import { expect, test } from '@playwright/test';
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
  await context.addInitScript(() => {
    window.confirm = () => true;
  });
});

test.use({ serviceWorkers: 'block' });

test('shared song can transition from Song Selection to active gameplay', async ({ page, baseURL }) => {
  test.slow();

  await test.step('Upsert shared song fixture into local Cloudflare storage', async () => {
    await upsertCloudflareSharedSongFixtureOrMock(page, baseURL);
  });

  await page.goto('/?e2e-test');

  await pages.landingPage.enterTheGame();
  await pages.mainMenuPage.goToInputSelectionPage();
  await pages.inputSelectionPage.selectComputersMicrophone();
  await pages.computersMicConnectionPage.goToMainMenu();

  await pages.mainMenuPage.goToSingSong();
  await pages.songLanguagesPage.ensureSongLanguageIsSelected('English');
  await pages.songLanguagesPage.continueAndGoToSongList();

  await pages.songListPage.searchSong(sharedSong.title);
  await expect(page.locator('[data-group-name="Unverified"]')).toBeVisible();
  await expect(pages.songListPage.songListContainer.getByText(sharedSong.title).first()).toBeVisible();

  await pages.songListPage.openSharedSongSearchResultCard(sharedSong.title, sharedSong.artist);
  await pages.songPreviewPage.goToInputSelectionPage();
  await pages.computersMicConnectionPage.continueToTheSong();
  await pages.songPreviewPage.goNext();
  await pages.songPreviewPage.playTheSongAndWaitForGameplay();

  await expect(pages.gamePage.getPlayerScoreElement(0)).toBeVisible({ timeout: 30000 });
});
