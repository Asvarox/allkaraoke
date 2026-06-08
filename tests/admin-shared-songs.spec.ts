import { expect, test } from '@playwright/test';
import { initTestMode } from './helpers';
import initialise from './page-objects/initialise';
import {
  adminPanelPassword,
  createExternalSongId,
  removeSharedSong,
  sharedCloudflareSongFixture,
  upsertSharedSong,
} from './shared-songs-admin-helper';

const editedSongId = 'cloudflare-artist-cloudflare-shared-unique-song';

let pages: ReturnType<typeof initialise>;
let currentExternalSongId = '';
let currentVisibleTitle = '';
let externalSongIdsToRemove: string[] = [];

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
  await Promise.all(externalSongIdsToRemove.map((externalSongId) => removeSharedSong(request, externalSongId)));
});

test.use({ serviceWorkers: 'block' });
test.describe.configure({ mode: 'serial' });

test('stores the admin password, lists shared songs, and logs out', async ({ page }) => {
  await page.goto('/admin?e2e-test');

  await test.step('Sign in and see the shared song', async () => {
    await pages.adminSharedSongsPage.signIn(adminPanelPassword);
    await pages.adminSharedSongsPage.search(currentVisibleTitle);
    await expect(pages.adminSharedSongsPage.table.rowContaining(currentVisibleTitle)).toBeVisible();
  });

  await test.step('Logout clears the stored password', async () => {
    await pages.adminSharedSongsPage.logout();
    await expect(pages.adminSharedSongsPage.passwordInput).toBeVisible();
    await pages.adminSharedSongsPage.expectPasswordClearedFromSessionStorage();
  });
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
