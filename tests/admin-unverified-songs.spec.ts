import { APIRequestContext, expect, test } from '@playwright/test';
import { initTestMode } from './helpers';
import initialise from './page-objects/initialise';
import {
  adminPanelPassword,
  createSharedSongId,
  removeUnverifiedSong,
  unverifiedCloudflareSongFixture,
  unverifiedCloudflareSongTxt,
  upsertUnverifiedSong,
} from './unverified-songs-admin-helper';

const editedSongId = 'cloudflare-artist-cloudflare-shared-unique-song';

let pages: ReturnType<typeof initialise>;
let currentSharedSongId = '';
let currentVisibleTitle = '';
let sharedSongIdsToRemove: string[] = [];

const queueTestTitles = [
  'saving during oldest-first processing redirects to the next unverified song',
  'deleting during oldest-first processing redirects to the next unverified song',
];

const createSharedSongIdFromProjectAndTitle = (projectName: string, title: string) =>
  `admin-${projectName}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const removeStaleQueueFixtures = async (request: APIRequestContext) => {
  for (const projectName of ['chromium', 'firefox']) {
    for (const title of queueTestTitles) {
      const sharedSongId = createSharedSongIdFromProjectAndTitle(projectName, title);

      await removeUnverifiedSong(request, sharedSongId);
      await removeUnverifiedSong(request, `${sharedSongId}-oldest`);
    }
  }
};

const makeUnverifiedSongTxtWithTitle = (title: string) =>
  unverifiedCloudflareSongTxt.replace(`#TITLE:${unverifiedCloudflareSongFixture.title}`, `#TITLE:${title}`);

const makeUnverifiedSongTxtWithTitleAndVideo = (title: string, videoId: string) =>
  makeUnverifiedSongTxtWithTitle(title).replace(
    `#VIDEO:v=${unverifiedCloudflareSongFixture.videoId}`,
    `#VIDEO:v=${videoId}`,
  );

const seedQueueSongs = async (request: APIRequestContext) => {
  await removeStaleQueueFixtures(request);
  const oldestUpdatedSharedSongId = `${currentSharedSongId}-oldest`;
  const oldestUpdatedVisibleTitle = `${currentVisibleTitle} Oldest`;
  const queueCurrentFirstSeenAt = -Date.now() * 1000;
  const queueOldestUpdatedFirstSeenAt = queueCurrentFirstSeenAt + 1;
  const queueOldestUpdatedValue = queueCurrentFirstSeenAt + 10;
  const queueCurrentUpdatedValue = queueCurrentFirstSeenAt + 20;
  sharedSongIdsToRemove.push(oldestUpdatedSharedSongId);

  await upsertUnverifiedSong(request, {
    sharedSongId: currentSharedSongId,
    title: currentVisibleTitle,
    songTxt: makeUnverifiedSongTxtWithTitleAndVideo(currentVisibleTitle, unverifiedCloudflareSongFixture.videoId),
    firstSeenAt: queueCurrentFirstSeenAt,
    updated: queueCurrentUpdatedValue,
    sourceUserId: 'admin-panel-e2e',
  });
  await upsertUnverifiedSong(request, {
    sharedSongId: oldestUpdatedSharedSongId,
    title: oldestUpdatedVisibleTitle,
    songTxt: makeUnverifiedSongTxtWithTitleAndVideo(oldestUpdatedVisibleTitle, 'Vueyx9TBEqE'),
    videoId: 'Vueyx9TBEqE',
    firstSeenAt: queueOldestUpdatedFirstSeenAt,
    updated: queueOldestUpdatedValue,
    sourceUserId: 'admin-panel-e2e',
  });

  return { oldestUpdatedSharedSongId, oldestUpdatedVisibleTitle };
};

test.beforeEach(async ({ page, context, browser, request }, testInfo) => {
  pages = initialise(page, context, browser);
  currentSharedSongId = createSharedSongId(testInfo);
  currentVisibleTitle = `Admin Panel `;
  sharedSongIdsToRemove = [currentSharedSongId];
  await upsertUnverifiedSong(request, {
    sharedSongId: currentSharedSongId,
    title: currentVisibleTitle,
    firstSeenAt: Date.UTC(2025, 0, 15),
    sourceUserId: 'admin-panel-e2e',
  });
  await initTestMode({ page, context });
});

test.afterEach(async ({ request }) => {
  for (const sharedSongId of sharedSongIdsToRemove) {
    await removeUnverifiedSong(request, sharedSongId);
  }
});

test.use({ serviceWorkers: 'block' });
test.describe.configure({ mode: 'serial' });

test('stores the admin password in session storage, lists unverified songs, and logs out', async ({ page }) => {
  await page.goto('/admin?e2e-test');

  await test.step('Sign in and see the shared song', async () => {
    await pages.adminUnverifiedSongsPage.signIn(adminPanelPassword);
    await pages.adminUnverifiedSongsPage.expectPasswordStoredInSessionStorage(adminPanelPassword);
    await pages.adminUnverifiedSongsPage.search(currentVisibleTitle);
    await expect(pages.adminUnverifiedSongsPage.table.rowContaining(currentVisibleTitle)).toBeVisible();
  });

  await test.step('Logout clears the stored password', async () => {
    await pages.adminUnverifiedSongsPage.logout();
    await expect(pages.adminUnverifiedSongsPage.passwordInput).toBeVisible();
    await pages.adminUnverifiedSongsPage.expectPasswordClearedFromStorage();
  });
});

test('remember me stores the admin password in local storage and skips the login form on a new page', async ({
  page,
}) => {
  await page.goto('/admin?e2e-test');

  await pages.adminUnverifiedSongsPage.signIn(adminPanelPassword, true);
  await pages.adminUnverifiedSongsPage.expectPasswordStoredInLocalStorage(adminPanelPassword);
  await pages.adminUnverifiedSongsPage.search(currentVisibleTitle);
  await expect(pages.adminUnverifiedSongsPage.table.rowContaining(currentVisibleTitle)).toBeVisible();

  const secondPage = await page.context().newPage();
  const secondPages = initialise(secondPage, secondPage.context(), secondPage.context().browser()!);

  await secondPage.goto('/admin?e2e-test');
  await expect(secondPages.adminUnverifiedSongsPage.passwordInput).not.toBeVisible();
  await expect(secondPages.adminUnverifiedSongsPage.adminHeading).toBeVisible();
  await secondPages.adminUnverifiedSongsPage.expectPasswordStoredInLocalStorage(adminPanelPassword);
  await secondPages.adminUnverifiedSongsPage.search(currentVisibleTitle);
  await expect(secondPages.adminUnverifiedSongsPage.table.rowContaining(currentVisibleTitle)).toBeVisible();
});

test('shows and sorts unverified songs by added date', async ({ page, request }) => {
  const olderSharedSongId = `${currentSharedSongId}-older`;
  const olderVisibleTitle = `${currentVisibleTitle} Older`;
  sharedSongIdsToRemove.push(olderSharedSongId);
  await upsertUnverifiedSong(request, {
    sharedSongId: olderSharedSongId,
    title: olderVisibleTitle,
    firstSeenAt: Date.UTC(2024, 0, 2),
    sourceUserId: 'admin-panel-e2e',
  });

  await page.goto('/admin?e2e-test');

  await pages.adminUnverifiedSongsPage.signIn(adminPanelPassword);
  await pages.adminUnverifiedSongsPage.search(currentVisibleTitle);
  await expect(pages.adminUnverifiedSongsPage.table.columnHeader('Added')).toBeVisible();
  await expect(pages.adminUnverifiedSongsPage.table.columnHeader('Updated')).toBeVisible();
  await expect(pages.adminUnverifiedSongsPage.table.rowWithTitle(currentVisibleTitle)).toContainText('Jan 15 2025,');
  await expect(pages.adminUnverifiedSongsPage.table.rowWithTitle(olderVisibleTitle)).toContainText('Jan 02 2024,');

  await pages.adminUnverifiedSongsPage.table.sortColumnDescending('Added');
  await expect(pages.adminUnverifiedSongsPage.table.tableRow(1)).toContainText(currentVisibleTitle);
  await expect(pages.adminUnverifiedSongsPage.table.tableRow(2)).toContainText(olderVisibleTitle);
});

test('persists unverified songs table page size and sorting after reload', async ({ page, request }) => {
  const olderSharedSongId = `${currentSharedSongId}-older`;
  const olderVisibleTitle = `${currentVisibleTitle} Older`;
  sharedSongIdsToRemove.push(olderSharedSongId);
  await upsertUnverifiedSong(request, {
    sharedSongId: olderSharedSongId,
    title: olderVisibleTitle,
    firstSeenAt: Date.UTC(2024, 0, 2),
    sourceUserId: 'admin-panel-e2e',
  });

  await page.goto('/admin?e2e-test');

  await pages.adminUnverifiedSongsPage.signIn(adminPanelPassword);
  await pages.adminUnverifiedSongsPage.search(currentVisibleTitle);
  await pages.adminUnverifiedSongsPage.table.setRowsPerPage(25);
  await pages.adminUnverifiedSongsPage.table.sortColumnDescending('Added');
  await pages.adminUnverifiedSongsPage.table.expectRowsPerPage(25);
  await pages.adminUnverifiedSongsPage.table.expectSortedDescending('Added');

  await page.reload();

  await expect(pages.adminUnverifiedSongsPage.adminHeading).toBeVisible();
  await pages.adminUnverifiedSongsPage.search(currentVisibleTitle);
  await pages.adminUnverifiedSongsPage.table.expectRowsPerPage(25);
  await pages.adminUnverifiedSongsPage.table.expectSortedDescending('Added');
  await expect(pages.adminUnverifiedSongsPage.table.rowWithTitle(currentVisibleTitle)).toBeVisible();
  await expect(pages.adminUnverifiedSongsPage.table.rowWithTitle(olderVisibleTitle)).toBeVisible();
});

test('saving during oldest-first processing redirects to the next unverified song', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Oldest-first queue tests share one KV namespace.');
  const { oldestUpdatedSharedSongId, oldestUpdatedVisibleTitle } = await seedQueueSongs(request);
  const syncedTitle = `${oldestUpdatedVisibleTitle} Synced`;

  await page.goto('/admin?e2e-test');

  await pages.adminUnverifiedSongsPage.signIn(adminPanelPassword);
  await pages.adminUnverifiedSongsPage.processOldestUnverifiedSong();
  await pages.songEditBasicInfoPage.expectEditedSongHeaderToBe(
    unverifiedCloudflareSongFixture.artist,
    oldestUpdatedVisibleTitle,
  );
  await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
  const oldestUpdatedSongVideoSource = await pages.songEditSyncLyricsToVideoPage.getVideoPlayerSource();
  expect(oldestUpdatedSongVideoSource).not.toBeNull();
  await pages.songEditSyncLyricsToVideoPage.goToMetadataStep();
  await pages.songEditMetadataPage.enterSongTitle(syncedTitle);
  await pages.songEditMetadataPage.saveAndGoToEditSongsPage();

  await pages.songEditBasicInfoPage.expectEditedSongHeaderToBe(
    unverifiedCloudflareSongFixture.artist,
    currentVisibleTitle,
  );
  await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
  await expect(pages.songEditSyncLyricsToVideoPage.videoPlayerSource).not.toHaveAttribute(
    'src',
    oldestUpdatedSongVideoSource!,
  );

  await expect
    .poll(async () => {
      const response = await request.get('/admin/unverified-songs', {
        headers: { 'x-admin-panel-password': adminPanelPassword },
      });
      const songs = (await response.json()) as Array<{ sharedSongId: string; title: string }>;

      return songs.find((song) => song.sharedSongId === oldestUpdatedSharedSongId)?.title;
    })
    .toBe(syncedTitle);

  await page.goto('/admin?e2e-test');
  await pages.adminUnverifiedSongsPage.search(syncedTitle);
  await expect(pages.adminUnverifiedSongsPage.table.rowWithTitle(syncedTitle)).toBeVisible();
});

test('deleting during oldest-first processing redirects to the next unverified song', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Oldest-first queue tests share one KV namespace.');
  const { oldestUpdatedSharedSongId, oldestUpdatedVisibleTitle } = await seedQueueSongs(request);
  page.once('dialog', (dialog) => dialog.accept());

  await page.goto('/admin?e2e-test');

  await pages.adminUnverifiedSongsPage.signIn(adminPanelPassword);
  await pages.adminUnverifiedSongsPage.processOldestUnverifiedSong();
  await pages.songEditBasicInfoPage.expectEditedSongHeaderToBe(
    unverifiedCloudflareSongFixture.artist,
    oldestUpdatedVisibleTitle,
  );
  await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
  await pages.songEditSyncLyricsToVideoPage.deleteAdminUnverifiedSong();

  await pages.songEditBasicInfoPage.expectEditedSongHeaderToBe(
    unverifiedCloudflareSongFixture.artist,
    currentVisibleTitle,
  );
  await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
  await expect
    .poll(async () => {
      const response = await request.get('/admin/unverified-songs', {
        headers: { 'x-admin-panel-password': adminPanelPassword },
      });
      const songs = (await response.json()) as Array<{ sharedSongId: string }>;

      return songs.some((song) => song.sharedSongId === oldestUpdatedSharedSongId);
    })
    .toBe(false);

  await page.goto('/admin?e2e-test');
  await pages.adminUnverifiedSongsPage.search(oldestUpdatedVisibleTitle);
  await expect(pages.adminUnverifiedSongsPage.table.rowWithTitle(oldestUpdatedVisibleTitle)).not.toBeVisible();
});

test('deletes an unverified song and refetches the list', async ({ page }) => {
  page.once('dialog', (dialog) => dialog.accept());

  await page.goto('/admin?e2e-test');

  await pages.adminUnverifiedSongsPage.signIn(adminPanelPassword);
  await pages.adminUnverifiedSongsPage.search(currentVisibleTitle);
  await expect(pages.adminUnverifiedSongsPage.table.rowContaining(currentVisibleTitle)).toBeVisible();

  await pages.adminUnverifiedSongsPage.table.deleteSongBySharedSongId(currentSharedSongId);
  await expect(pages.adminUnverifiedSongsPage.table.rowContaining(currentVisibleTitle)).not.toBeVisible();
});

test('admin edit save updates KV and returns to admin', async ({ page, request }) => {
  await page.goto('/admin?e2e-test');

  await pages.adminUnverifiedSongsPage.signIn(adminPanelPassword);
  await pages.adminUnverifiedSongsPage.search(currentVisibleTitle);
  await pages.adminUnverifiedSongsPage.table.editSongBySharedSongId(currentSharedSongId);
  await expect(page).toHaveURL(/step=sync/);
  await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
  await pages.songEditSyncLyricsToVideoPage.goToMetadataStep();
  await pages.songEditMetadataPage.saveAndGoToEditSongsPage();

  await expect(page).toHaveURL(/\/admin\/?(\?|$)/);

  const response = await request.get('/admin/unverified-songs', {
    headers: { 'x-admin-panel-password': adminPanelPassword },
  });
  await expect(response).toBeOK();

  const songs = (await response.json()) as Array<{
    sharedSongId: string;
    songId: string;
    title: string;
    firstSeenAt: number;
    updated: number;
  }>;
  const editedSong = songs.find((song) => song.sharedSongId === currentSharedSongId);

  expect(editedSong).toMatchObject({
    songId: editedSongId,
    title: unverifiedCloudflareSongFixture.title,
  });
  expect(editedSong).toBeDefined();
  expect(editedSong!.updated).toBeGreaterThan(editedSong!.firstSeenAt);
});
