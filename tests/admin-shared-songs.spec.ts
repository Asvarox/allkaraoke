import { APIRequestContext, expect, test } from '@playwright/test';
import { initTestMode } from './helpers';
import initialise from './page-objects/initialise';
import {
  adminPanelPassword,
  createExternalSongId,
  removeSharedSong,
  sharedCloudflareSongFixture,
  sharedCloudflareSongTxt,
  upsertSharedSong,
} from './shared-songs-admin-helper';

const editedSongId = 'cloudflare-artist-cloudflare-shared-unique-song';

let pages: ReturnType<typeof initialise>;
let currentExternalSongId = '';
let currentVisibleTitle = '';
let externalSongIdsToRemove: string[] = [];

const queueTestTitles = [
  'saving during oldest-first processing redirects to the next unverified shared song',
  'deleting during oldest-first processing redirects to the next unverified shared song',
];

const createExternalSongIdFromProjectAndTitle = (projectName: string, title: string) =>
  `admin-${projectName}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const removeStaleQueueFixtures = async (request: APIRequestContext) => {
  for (const projectName of ['chromium', 'firefox']) {
    for (const title of queueTestTitles) {
      const externalSongId = createExternalSongIdFromProjectAndTitle(projectName, title);

      await removeSharedSong(request, externalSongId);
      await removeSharedSong(request, `${externalSongId}-oldest`);
    }
  }
};

const makeSharedSongTxtWithTitle = (title: string) =>
  sharedCloudflareSongTxt.replace(`#TITLE:${sharedCloudflareSongFixture.title}`, `#TITLE:${title}`);

const makeSharedSongTxtWithTitleAndVideo = (title: string, videoId: string) =>
  makeSharedSongTxtWithTitle(title).replace(`#VIDEO:v=${sharedCloudflareSongFixture.videoId}`, `#VIDEO:v=${videoId}`);

const seedQueueSongs = async (request: APIRequestContext) => {
  await removeStaleQueueFixtures(request);
  const olderExternalSongId = `${currentExternalSongId}-oldest`;
  const olderVisibleTitle = `${currentVisibleTitle} Oldest`;
  const queueOlderFirstSeenAt = -Date.now() * 1000;
  const queueCurrentFirstSeenAt = queueOlderFirstSeenAt + 1;
  externalSongIdsToRemove.push(olderExternalSongId);

  await upsertSharedSong(request, {
    externalSongId: currentExternalSongId,
    title: currentVisibleTitle,
    songTxt: makeSharedSongTxtWithTitleAndVideo(currentVisibleTitle, sharedCloudflareSongFixture.videoId),
    firstSeenAt: queueCurrentFirstSeenAt,
    sourceUserId: 'admin-panel-e2e',
  });
  await upsertSharedSong(request, {
    externalSongId: olderExternalSongId,
    title: olderVisibleTitle,
    songTxt: makeSharedSongTxtWithTitleAndVideo(olderVisibleTitle, 'Vueyx9TBEqE'),
    videoId: 'Vueyx9TBEqE',
    firstSeenAt: queueOlderFirstSeenAt,
    sourceUserId: 'admin-panel-e2e',
  });

  return { olderExternalSongId, olderVisibleTitle };
};

test.beforeEach(async ({ page, context, browser, request }, testInfo) => {
  pages = initialise(page, context, browser);
  currentExternalSongId = createExternalSongId(testInfo);
  currentVisibleTitle = `Admin Panel ${currentExternalSongId}`;
  externalSongIdsToRemove = [currentExternalSongId];
  await upsertSharedSong(request, {
    externalSongId: currentExternalSongId,
    title: currentVisibleTitle,
    firstSeenAt: Date.UTC(2025, 0, 15),
    sourceUserId: 'admin-panel-e2e',
  });
  await initTestMode({ page, context });
});

test.afterEach(async ({ request }) => {
  for (const externalSongId of externalSongIdsToRemove) {
    await removeSharedSong(request, externalSongId);
  }
});

test.use({ serviceWorkers: 'block' });
test.describe.configure({ mode: 'serial' });

test('stores the admin password in session storage, lists shared songs, and logs out', async ({ page }) => {
  await page.goto('/admin?e2e-test');

  await test.step('Sign in and see the shared song', async () => {
    await pages.adminSharedSongsPage.signIn(adminPanelPassword);
    await pages.adminSharedSongsPage.expectPasswordStoredInSessionStorage(adminPanelPassword);
    await pages.adminSharedSongsPage.search(currentVisibleTitle);
    await expect(pages.adminSharedSongsPage.table.rowContaining(currentVisibleTitle)).toBeVisible();
  });

  await test.step('Logout clears the stored password', async () => {
    await pages.adminSharedSongsPage.logout();
    await expect(pages.adminSharedSongsPage.passwordInput).toBeVisible();
    await pages.adminSharedSongsPage.expectPasswordClearedFromStorage();
  });
});

test('remember me stores the admin password in local storage and skips the login form on a new page', async ({
  page,
}) => {
  await page.goto('/admin?e2e-test');

  await pages.adminSharedSongsPage.signIn(adminPanelPassword, true);
  await pages.adminSharedSongsPage.expectPasswordStoredInLocalStorage(adminPanelPassword);
  await pages.adminSharedSongsPage.search(currentVisibleTitle);
  await expect(pages.adminSharedSongsPage.table.rowContaining(currentVisibleTitle)).toBeVisible();

  const secondPage = await page.context().newPage();
  const secondPages = initialise(secondPage, secondPage.context(), secondPage.context().browser()!);

  await secondPage.goto('/admin?e2e-test');
  await expect(secondPages.adminSharedSongsPage.passwordInput).not.toBeVisible();
  await expect(secondPages.adminSharedSongsPage.adminHeading).toBeVisible();
  await secondPages.adminSharedSongsPage.expectPasswordStoredInLocalStorage(adminPanelPassword);
  await secondPages.adminSharedSongsPage.search(currentVisibleTitle);
  await expect(secondPages.adminSharedSongsPage.table.rowContaining(currentVisibleTitle)).toBeVisible();
});

test('shows and sorts shared songs by added date', async ({ page, request }) => {
  const olderExternalSongId = `${currentExternalSongId}-older`;
  const olderVisibleTitle = `${currentVisibleTitle} Older`;
  externalSongIdsToRemove.push(olderExternalSongId);
  await upsertSharedSong(request, {
    externalSongId: olderExternalSongId,
    title: olderVisibleTitle,
    firstSeenAt: Date.UTC(2024, 0, 2),
    sourceUserId: 'admin-panel-e2e',
  });

  await page.goto('/admin?e2e-test');

  await pages.adminSharedSongsPage.signIn(adminPanelPassword);
  await pages.adminSharedSongsPage.search(currentExternalSongId);
  await expect(pages.adminSharedSongsPage.table.columnHeader('Added')).toBeVisible();
  await expect(pages.adminSharedSongsPage.table.rowWithTitle(currentVisibleTitle)).toContainText('Jan 15 2025,');
  await expect(pages.adminSharedSongsPage.table.rowWithTitle(olderVisibleTitle)).toContainText('Jan 02 2024,');

  await pages.adminSharedSongsPage.table.sortColumnDescending('Added');
  await expect(pages.adminSharedSongsPage.table.tableRow(1)).toContainText(currentVisibleTitle);
  await expect(pages.adminSharedSongsPage.table.tableRow(2)).toContainText(olderVisibleTitle);
});

test('saving during oldest-first processing redirects to the next unverified shared song', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Oldest-first queue tests share one KV namespace.');
  const { olderExternalSongId, olderVisibleTitle } = await seedQueueSongs(request);
  const syncedTitle = `${olderVisibleTitle} Synced`;

  await page.goto('/admin?e2e-test');

  await pages.adminSharedSongsPage.signIn(adminPanelPassword);
  await pages.adminSharedSongsPage.processOldestUnverifiedSong();
  await pages.songEditBasicInfoPage.expectEditedSongHeaderToBe(sharedCloudflareSongFixture.artist, olderVisibleTitle);
  await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
  const olderSongVideoSource = await pages.songEditSyncLyricsToVideoPage.getVideoPlayerSource();
  expect(olderSongVideoSource).not.toBeNull();
  await pages.songEditSyncLyricsToVideoPage.goToMetadataStep();
  await pages.songEditMetadataPage.enterSongTitle(syncedTitle);
  await pages.songEditMetadataPage.saveAndGoToEditSongsPage();

  await pages.songEditBasicInfoPage.expectEditedSongHeaderToBe(sharedCloudflareSongFixture.artist, currentVisibleTitle);
  await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
  await expect(pages.songEditSyncLyricsToVideoPage.videoPlayerSource).not.toHaveAttribute('src', olderSongVideoSource!);

  await expect
    .poll(async () => {
      const response = await request.get('/admin/shared-songs', {
        headers: { 'x-admin-panel-password': adminPanelPassword },
      });
      const songs = (await response.json()) as Array<{ externalSongId: string; title: string }>;

      return songs.find((song) => song.externalSongId === olderExternalSongId)?.title;
    })
    .toBe(syncedTitle);

  await page.goto('/admin?e2e-test');
  await pages.adminSharedSongsPage.search(syncedTitle);
  await expect(pages.adminSharedSongsPage.table.rowWithTitle(syncedTitle)).toBeVisible();
});

test('deleting during oldest-first processing redirects to the next unverified shared song', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Oldest-first queue tests share one KV namespace.');
  const { olderExternalSongId, olderVisibleTitle } = await seedQueueSongs(request);
  page.once('dialog', (dialog) => dialog.accept());

  await page.goto('/admin?e2e-test');

  await pages.adminSharedSongsPage.signIn(adminPanelPassword);
  await pages.adminSharedSongsPage.processOldestUnverifiedSong();
  await pages.songEditBasicInfoPage.expectEditedSongHeaderToBe(sharedCloudflareSongFixture.artist, olderVisibleTitle);
  await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
  await pages.songEditSyncLyricsToVideoPage.deleteAdminSharedSong();

  await pages.songEditBasicInfoPage.expectEditedSongHeaderToBe(sharedCloudflareSongFixture.artist, currentVisibleTitle);
  await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
  await expect
    .poll(async () => {
      const response = await request.get('/admin/shared-songs', {
        headers: { 'x-admin-panel-password': adminPanelPassword },
      });
      const songs = (await response.json()) as Array<{ externalSongId: string }>;

      return songs.some((song) => song.externalSongId === olderExternalSongId);
    })
    .toBe(false);

  await page.goto('/admin?e2e-test');
  await pages.adminSharedSongsPage.search(olderVisibleTitle);
  await expect(pages.adminSharedSongsPage.table.rowWithTitle(olderVisibleTitle)).not.toBeVisible();
});

test('deletes a shared song and refetches the list', async ({ page }) => {
  page.once('dialog', (dialog) => dialog.accept());

  await page.goto('/admin?e2e-test');

  await pages.adminSharedSongsPage.signIn(adminPanelPassword);
  await pages.adminSharedSongsPage.search(currentVisibleTitle);
  await expect(pages.adminSharedSongsPage.table.rowContaining(currentVisibleTitle)).toBeVisible();

  await pages.adminSharedSongsPage.table.deleteSongByExternalId(currentExternalSongId);
  await expect(pages.adminSharedSongsPage.table.rowContaining(currentVisibleTitle)).not.toBeVisible();
});

test('admin edit save updates KV and returns to admin', async ({ page, request }) => {
  await page.goto('/admin?e2e-test');

  await pages.adminSharedSongsPage.signIn(adminPanelPassword);
  await pages.adminSharedSongsPage.search(currentVisibleTitle);
  await pages.adminSharedSongsPage.table.editSongByExternalId(currentExternalSongId);
  await expect(page).toHaveURL(/step=sync/);
  await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
  await pages.songEditSyncLyricsToVideoPage.goToMetadataStep();
  await pages.songEditMetadataPage.saveAndGoToEditSongsPage();

  await expect(page).toHaveURL(/\/admin\/?(\?|$)/);

  const response = await request.get('/admin/shared-songs', {
    headers: { 'x-admin-panel-password': adminPanelPassword },
  });
  await expect(response).toBeOK();

  const songs = (await response.json()) as Array<{
    externalSongId: string;
    songId: string;
    title: string;
  }>;
  const editedSong = songs.find((song) => song.externalSongId === currentExternalSongId);

  expect(editedSong).toMatchObject({
    songId: editedSongId,
    title: sharedCloudflareSongFixture.title,
  });
});
