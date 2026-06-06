import { expect, test } from '@playwright/test';
import { readFileSync } from 'fs';
import { initTestMode, mockSongs } from './helpers';
import initialise from './page-objects/initialise';

const sharedSong = {
  externalSongId: 'external-1',
  songId: 'shared-cloudflare-e2e-song',
  title: 'Cloudflare Shared Unique Song',
  artist: 'Cloudflare Artist',
  language: ['English'],
  videoId: 'koBUXESJZ8g',
};

const editedSharedSong = {
  ...sharedSong,
  songId: 'cloudflare-artist-cloudflare-shared-unique-song',
};

const songTxt = readFileSync('./tests/fixtures/songs/shared-cloudflare-e2e.txt', { encoding: 'utf-8' });

let pages: ReturnType<typeof initialise>;

test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test.use({ serviceWorkers: 'block' });
test.describe.configure({ mode: 'serial' });

test('stores the admin password, lists shared songs, and logs out', async ({ page }) => {
  await page.route('**/admin/shared-songs', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, body: JSON.stringify([sharedSong]) });
      return;
    }

    await route.fallback();
  });

  await page.goto('/admin?e2e-test');

  await test.step('Sign in and see the shared song', async () => {
    await pages.adminSharedSongsPage.signIn('admin-password');
    await expect(pages.adminSharedSongsPage.rowText(sharedSong.title)).toBeVisible();
    await expect(pages.adminSharedSongsPage.rowText(sharedSong.externalSongId)).toBeVisible();
  });

  await test.step('Logout clears the stored password', async () => {
    await pages.adminSharedSongsPage.logout();
    await expect(pages.adminSharedSongsPage.passwordInput).toBeVisible();
    await pages.adminSharedSongsPage.expectPasswordClearedFromSessionStorage();
  });
});

test('deletes a shared song and refetches the list', async ({ page }) => {
  let getCount = 0;

  await page.route('**/admin/shared-songs**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname !== '/admin/shared-songs') {
      await route.fallback();
      return;
    }

    if (request.method() === 'GET') {
      getCount += 1;
      await route.fulfill({ status: 200, body: JSON.stringify(getCount === 1 ? [sharedSong] : []) });
      return;
    }

    if (request.method() === 'DELETE') {
      expect(url.searchParams.get('id')).toBe(sharedSong.externalSongId);
      await route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
      return;
    }

    await route.fallback();
  });

  page.once('dialog', (dialog) => dialog.accept());

  await page.goto('/admin?e2e-test');

  await pages.adminSharedSongsPage.signIn('admin-password');
  await expect(pages.adminSharedSongsPage.rowText(sharedSong.title)).toBeVisible();

  await pages.adminSharedSongsPage.deleteSong(sharedSong.title);
  await expect(pages.adminSharedSongsPage.rowText(sharedSong.title)).not.toBeVisible();
});

test('admin edit save updates KV and returns to admin', async ({ page }) => {
  let updateBody: unknown;

  await page.addInitScript(() => {
    sessionStorage.setItem('shared-songs-admin-password', 'admin-password');
  });

  await page.route('**/shared-song**', async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname !== '/shared-song') {
      await route.fallback();
      return;
    }

    expect(url.searchParams.get('id')).toBe(sharedSong.externalSongId);
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        ...sharedSong,
        songTxt,
      }),
    });
  });

  await page.route('**/admin/shared-song**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname !== '/admin/shared-song') {
      await route.fallback();
      return;
    }

    expect(request.method()).toBe('PUT');
    expect(url.searchParams.get('id')).toBe(sharedSong.externalSongId);
    updateBody = request.postDataJSON();

    await route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
  });

  await page.route('**/admin/shared-songs', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, body: JSON.stringify([editedSharedSong]) });
      return;
    }

    await route.fallback();
  });

  await page.goto('/edit/song/?externalSong=external-1&admin=true&step=metadata&e2e-test');

  await pages.songEditMetadataPage.saveAndGoToEditSongsPage();

  await expect(page).toHaveURL(/\/admin\/?(\?|$)/);
  await expect(pages.adminSharedSongsPage.rowText(editedSharedSong.songId)).toBeVisible();
  expect(updateBody).toMatchObject({
    songTxt: expect.any(String),
    songId: expect.any(String),
    artist: sharedSong.artist,
    title: sharedSong.title,
    language: sharedSong.language,
    videoId: sharedSong.videoId,
  });
});
