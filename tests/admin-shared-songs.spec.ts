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

test.beforeEach(async ({ page, context, browser, request }, testInfo) => {
  pages = initialise(page, context, browser);
  currentExternalSongId = createExternalSongId(testInfo);
  currentVisibleTitle = `Admin Panel ${currentExternalSongId}`;
  await upsertSharedSong(request, {
    externalSongId: currentExternalSongId,
    title: currentVisibleTitle,
    sourceUserId: 'admin-panel-e2e',
  });
  await initTestMode({ page, context });
});

test.afterEach(async ({ request }) => {
  await removeSharedSong(request, currentExternalSongId);
});

test.use({ serviceWorkers: 'block' });
test.describe.configure({ mode: 'serial' });

test('stores the admin password, lists shared songs, and logs out', async ({ page }) => {
  await page.goto('/admin?e2e-test');

  await test.step('Sign in and see the shared song', async () => {
    await pages.adminSharedSongsPage.signIn(adminPanelPassword);
    await pages.adminSharedSongsPage.search(currentVisibleTitle);
    await expect(pages.adminSharedSongsPage.rowContaining(currentVisibleTitle)).toBeVisible();
  });

  await test.step('Logout clears the stored password', async () => {
    await pages.adminSharedSongsPage.logout();
    await expect(pages.adminSharedSongsPage.passwordInput).toBeVisible();
    await pages.adminSharedSongsPage.expectPasswordClearedFromSessionStorage();
  });
});

test('deletes a shared song and refetches the list', async ({ page }) => {
  page.once('dialog', (dialog) => dialog.accept());

  await page.goto('/admin?e2e-test');

  await pages.adminSharedSongsPage.signIn(adminPanelPassword);
  await pages.adminSharedSongsPage.search(currentVisibleTitle);
  await expect(pages.adminSharedSongsPage.rowContaining(currentVisibleTitle)).toBeVisible();

  await pages.adminSharedSongsPage.deleteSongByExternalId(currentExternalSongId);
  await expect(pages.adminSharedSongsPage.rowContaining(currentVisibleTitle)).not.toBeVisible();
});

test('admin edit save updates KV and returns to admin', async ({ page, request }) => {
  await page.goto('/admin?e2e-test');

  await pages.adminSharedSongsPage.signIn(adminPanelPassword);
  await pages.adminSharedSongsPage.search(currentVisibleTitle);
  await pages.adminSharedSongsPage.editSongByExternalId(currentExternalSongId);
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
