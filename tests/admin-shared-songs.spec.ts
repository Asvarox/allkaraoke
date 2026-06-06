import { expect, request as playwrightRequest, test, TestInfo } from '@playwright/test';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { initTestMode } from './helpers';
import initialise from './page-objects/initialise';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });
dotenv.config({ path: '.dev.vars', override: true });

const songTxt = readFileSync('./tests/fixtures/songs/shared-cloudflare-e2e.txt', { encoding: 'utf-8' });
const adminPanelPassword = process.env.ADMIN_PANEL_PASSWORD ?? '12345';
const sharedSongsAdminToken = process.env.SHARED_SONGS_ADMIN_TOKEN ?? 'local-shared-songs-admin-token';

const sharedSong = {
  songId: 'shared-cloudflare-e2e-song',
  title: 'Cloudflare Shared Unique Song',
  artist: 'Cloudflare Artist',
  language: ['English'],
  videoId: 'koBUXESJZ8g',
};

const editedSongId = 'cloudflare-artist-cloudflare-shared-unique-song';

const getBaseUrl = (playwrightBaseUrl?: string) =>
  playwrightBaseUrl ? new URL(playwrightBaseUrl).origin : 'https://localhost:3000';

const adminTokenHeaders = {
  'Content-Type': 'application/json',
  'x-shared-songs-admin-token': sharedSongsAdminToken,
};

const createExternalSongId = (testInfo: TestInfo) =>
  `admin-${testInfo.project.name}-${testInfo.title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const upsertSharedSong = async (baseUrl: string, externalSongId: string) => {
  const api = await playwrightRequest.newContext({ ignoreHTTPSErrors: true });
  const now = Date.now();

  const response = await api.post(`${baseUrl}/shared-songs-admin`, {
    headers: adminTokenHeaders,
    data: {
      externalSongId,
      songId: sharedSong.songId,
      songTxt,
      artist: sharedSong.artist,
      title: `${sharedSong.title} ${externalSongId}`,
      language: sharedSong.language,
      videoId: sharedSong.videoId,
      verifiedAt: now,
      firstSeenAt: now,
      lastSeenAt: now,
      sourceUserId: 'admin-panel-e2e',
      sourceEventAt: now,
    },
  });

  expect(response.ok()).toBe(true);
  await api.dispose();
};

const removeSharedSong = async (baseUrl: string, externalSongId: string) => {
  const api = await playwrightRequest.newContext({ ignoreHTTPSErrors: true });

  await api.delete(`${baseUrl}/shared-songs-admin?id=${encodeURIComponent(externalSongId)}`, {
    headers: adminTokenHeaders,
  });
  await api.dispose();
};

let pages: ReturnType<typeof initialise>;
let currentBaseUrl = 'https://localhost:3000';
let currentExternalSongId = '';

test.beforeEach(async ({ page, context, browser, baseURL }, testInfo) => {
  pages = initialise(page, context, browser);
  currentBaseUrl = getBaseUrl(baseURL);
  currentExternalSongId = createExternalSongId(testInfo);
  await upsertSharedSong(currentBaseUrl, currentExternalSongId);
  await initTestMode({ page, context });
});

test.afterEach(async () => {
  await removeSharedSong(currentBaseUrl, currentExternalSongId);
});

test.use({ serviceWorkers: 'block' });
test.describe.configure({ mode: 'serial' });

test('stores the admin password, lists shared songs, and logs out', async ({ page }) => {
  await page.goto('/admin?e2e-test');

  await test.step('Sign in and see the shared song', async () => {
    await pages.adminSharedSongsPage.signIn(adminPanelPassword);
    await pages.adminSharedSongsPage.search(currentExternalSongId);
    await expect(pages.adminSharedSongsPage.rowContaining(currentExternalSongId)).toBeVisible();
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
  await pages.adminSharedSongsPage.search(currentExternalSongId);
  await expect(pages.adminSharedSongsPage.rowContaining(currentExternalSongId)).toBeVisible();

  await pages.adminSharedSongsPage.deleteSongByExternalId(currentExternalSongId);
  await expect(pages.adminSharedSongsPage.rowContaining(currentExternalSongId)).not.toBeVisible();
});

test('admin edit save updates KV and returns to admin', async ({ page }) => {
  await page.addInitScript((password) => {
    sessionStorage.setItem('admin-panel-password', password);
  }, adminPanelPassword);

  await page.goto(`/edit/song/?externalSong=${currentExternalSongId}&admin=true&step=metadata&e2e-test`);

  await pages.songEditMetadataPage.saveAndGoToEditSongsPage();

  await expect(page).toHaveURL(/\/admin\/?(\?|$)/);
  await pages.adminSharedSongsPage.search(currentExternalSongId);
  const editedRow = pages.adminSharedSongsPage.rowContaining(currentExternalSongId);
  await expect(editedRow).toBeVisible();
  await expect(editedRow).toContainText(editedSongId);

  const response = await page.request.get(`/shared-song?id=${encodeURIComponent(currentExternalSongId)}`);
  await expect(response).toBeOK();
  await expect(response.json()).resolves.toMatchObject({
    externalSongId: currentExternalSongId,
    songId: editedSongId,
    artist: sharedSong.artist,
    title: sharedSong.title,
    language: sharedSong.language,
    videoId: sharedSong.videoId,
  });
});
