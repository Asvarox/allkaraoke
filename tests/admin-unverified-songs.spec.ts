import { APIRequestContext, expect, test } from '@playwright/test';

import { Song } from '~/interfaces';
import beatToMs from '~/modules/game-engine/game-state/helpers/beat-to-ms';
import convertTxtToSong from '~/modules/songs/utils/convert-txt-to-song';
import { getLastNoteEndFromSections } from '~/modules/songs/utils/notes-selectors';
import { processSong } from '~/modules/songs/utils/process-song/process-song';

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
  'saving during queue processing redirects to the next unverified song',
  'deleting during queue processing redirects to the next unverified song',
];

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

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

const getProcessedSong = (songTxt: string): Song => processSong(convertTxtToSong(songTxt));

const getDesiredEndTimeValue = (song: Song) => {
  const lastNoteEndBeat = Math.max(...song.tracks.map((track) => getLastNoteEndFromSections(track.sections)));

  return String(Math.round(beatToMs(lastNoteEndBeat, song) + song.gap));
};

const makeUnverifiedSongTxt = ({
  title,
  videoId = unverifiedCloudflareSongFixture.videoId,
  bpm = '180',
  gap = '1000',
}: {
  title: string;
  videoId?: string;
  bpm?: string;
  gap?: string;
}) =>
  makeUnverifiedSongTxtWithTitle(title)
    .replace(`#VIDEO:v=${unverifiedCloudflareSongFixture.videoId}`, `#VIDEO:v=${videoId}`)
    .replace('#BPM:180', `#BPM:${bpm}`)
    .replace('#ALLKARAOKE_REALBPM:180', `#ALLKARAOKE_REALBPM:${bpm}`)
    .replace('#GAP:1000', `#GAP:${gap}`);

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
    songTxt: makeUnverifiedSongTxt({ title: currentVisibleTitle }),
    firstSeenAt: queueCurrentFirstSeenAt,
    updated: queueCurrentUpdatedValue,
    sourceUserId: 'admin-panel-e2e',
  });
  await upsertUnverifiedSong(request, {
    sharedSongId: oldestUpdatedSharedSongId,
    title: oldestUpdatedVisibleTitle,
    songTxt: makeUnverifiedSongTxt({
      title: oldestUpdatedVisibleTitle,
      videoId: 'Vueyx9TBEqE',
      bpm: '240',
      gap: '1500',
    }),
    videoId: 'Vueyx9TBEqE',
    firstSeenAt: queueOldestUpdatedFirstSeenAt,
    updated: queueOldestUpdatedValue,
    sourceUserId: 'admin-panel-e2e',
  });

  // Random queue selection picks from the whole queue, so any other unverified songs left over in the
  // local KV store would make the "which song comes first" assertions non-deterministic. Scope the
  // queue down to just the two songs these tests care about.
  const response = await request.get('/admin/unverified-songs', {
    headers: { 'x-admin-panel-password': adminPanelPassword },
  });
  const existingSongs = (await response.json()) as Array<{ sharedSongId: string }>;
  const extraSharedSongIds = existingSongs
    .map((song) => song.sharedSongId)
    .filter((sharedSongId) => sharedSongId !== currentSharedSongId && sharedSongId !== oldestUpdatedSharedSongId);

  // Deletes must run sequentially: removeUnverifiedSong does a read-modify-write of the shared
  // index, so concurrent deletes race and can leave stale (already-deleted) entries in the index.
  for (const sharedSongId of extraSharedSongIds) {
    await removeUnverifiedSong(request, sharedSongId);
  }

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

test('saving during queue processing redirects to the next unverified song', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Queue processing tests share one KV namespace.');
  const { oldestUpdatedSharedSongId, oldestUpdatedVisibleTitle } = await seedQueueSongs(request);
  const currentQueueSongTxt = makeUnverifiedSongTxt({ title: currentVisibleTitle });
  const oldestQueueSongTxt = makeUnverifiedSongTxt({
    title: oldestUpdatedVisibleTitle,
    videoId: 'Vueyx9TBEqE',
    bpm: '240',
    gap: '1500',
  });
  const currentQueueSong = getProcessedSong(currentQueueSongTxt);
  const oldestQueueSong = getProcessedSong(oldestQueueSongTxt);
  const sharedSongIdsInQueue = [currentSharedSongId, oldestUpdatedSharedSongId];
  const songSpecsBySharedSongId: Record<
    string,
    { visibleTitle: string; defaultBpm: string; defaultDesiredEnd: string }
  > = {
    [currentSharedSongId]: {
      visibleTitle: currentVisibleTitle,
      defaultBpm: String(currentQueueSong.bpm),
      defaultDesiredEnd: getDesiredEndTimeValue(currentQueueSong),
    },
    [oldestUpdatedSharedSongId]: {
      visibleTitle: oldestUpdatedVisibleTitle,
      defaultBpm: String(oldestQueueSong.bpm),
      defaultDesiredEnd: getDesiredEndTimeValue(oldestQueueSong),
    },
  };

  await page.goto('/admin?e2e-test');

  await pages.adminUnverifiedSongsPage.signIn(adminPanelPassword);
  await pages.adminUnverifiedSongsPage.processRandomUnverifiedSong();
  await expect(pages.songEditBasicInfoPage.editedSongHeader).toBeVisible();

  const firstHeaderText = normalizeWhitespace((await pages.songEditBasicInfoPage.editedSongHeader.textContent()) ?? '');
  const firstSharedSongId = sharedSongIdsInQueue.find(
    (sharedSongId) =>
      firstHeaderText ===
      normalizeWhitespace(
        `${unverifiedCloudflareSongFixture.artist} - ${songSpecsBySharedSongId[sharedSongId].visibleTitle}`,
      ),
  );
  expect(firstSharedSongId, 'processing the queue should open one of the seeded unverified songs').toBeDefined();

  const secondSharedSongId = sharedSongIdsInQueue.find((sharedSongId) => sharedSongId !== firstSharedSongId)!;
  const firstSpec = songSpecsBySharedSongId[firstSharedSongId!];
  const secondSpec = songSpecsBySharedSongId[secondSharedSongId];
  const syncedTitle = `${firstSpec.visibleTitle} Synced`;
  const syncedBpm = '190';
  const syncedLyricsGap = '1234';
  const syncedDesiredEnd = '9999';
  const syncedTrackName = 'Queue Track Name';

  await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
  const firstSongVideoSource = await pages.songEditSyncLyricsToVideoPage.getVideoPlayerSource();
  expect(firstSongVideoSource).not.toBeNull();
  await expect(pages.songEditSyncLyricsToVideoPage.changeLyricsBpmInput).toHaveValue(firstSpec.defaultBpm);
  await expect(pages.songEditSyncLyricsToVideoPage.desiredSongEndTimeInput).toHaveValue(firstSpec.defaultDesiredEnd);
  await pages.songEditSyncLyricsToVideoPage.enterLyricsBPM(syncedBpm);
  await pages.songEditSyncLyricsToVideoPage.enterLyricsGapShift(syncedLyricsGap);
  await pages.songEditSyncLyricsToVideoPage.enterDesiredSongEndTime(syncedDesiredEnd);
  await pages.songEditSyncLyricsToVideoPage.enterSongTrackName(syncedTrackName);
  await pages.songEditSyncLyricsToVideoPage.goToMetadataStep();
  await pages.songEditMetadataPage.enterSongTitle(syncedTitle);
  await pages.songEditMetadataPage.saveAndGoToEditSongsPage();

  await pages.songEditBasicInfoPage.expectEditedSongHeaderToBe(
    unverifiedCloudflareSongFixture.artist,
    secondSpec.visibleTitle,
  );
  await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
  await expect(pages.songEditSyncLyricsToVideoPage.videoPlayerSource).not.toHaveAttribute('src', firstSongVideoSource!);
  await expect(pages.songEditSyncLyricsToVideoPage.changeLyricsBpmInput).toHaveValue(secondSpec.defaultBpm);
  await expect(pages.songEditSyncLyricsToVideoPage.lyricsGapShiftInput).toHaveValue('0');
  await expect(pages.songEditSyncLyricsToVideoPage.desiredSongEndTimeInput).toHaveValue(secondSpec.defaultDesiredEnd);
  await expect(pages.songEditSyncLyricsToVideoPage.trackNameInput).toHaveValue('');

  await expect
    .poll(async () => {
      const response = await request.get('/admin/unverified-songs', {
        headers: { 'x-admin-panel-password': adminPanelPassword },
      });
      const songs = (await response.json()) as Array<{ sharedSongId: string; title: string }>;

      return songs.find((song) => song.sharedSongId === firstSharedSongId)?.title;
    })
    .toBe(syncedTitle);

  const savedSongResponse = await request.get(`/unverified-song?id=${encodeURIComponent(firstSharedSongId!)}`);
  await expect(savedSongResponse).toBeOK();

  const savedSong = (await savedSongResponse.json()) as { title: string; songTxt: string };
  expect(savedSong.title).toBe(syncedTitle);
  expect(savedSong.songTxt).toContain(`#BPM:${syncedBpm}`);

  const nextSongResponse = await request.get(`/unverified-song?id=${encodeURIComponent(secondSharedSongId)}`);
  await expect(nextSongResponse).toBeOK();

  const nextSong = (await nextSongResponse.json()) as { songTxt: string };
  expect(nextSong.songTxt).toContain(`#BPM:${secondSpec.defaultBpm}`);

  await page.goto('/admin?e2e-test');
  await pages.adminUnverifiedSongsPage.search(syncedTitle);
  await expect(pages.adminUnverifiedSongsPage.table.rowWithTitle(syncedTitle)).toBeVisible();
});

test('deleting during queue processing redirects to the next unverified song', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Queue processing tests share one KV namespace.');
  const { oldestUpdatedSharedSongId, oldestUpdatedVisibleTitle } = await seedQueueSongs(request);
  page.once('dialog', (dialog) => dialog.accept());

  const sharedSongIdsInQueue = [currentSharedSongId, oldestUpdatedSharedSongId];
  const visibleTitleBySharedSongId: Record<string, string> = {
    [currentSharedSongId]: currentVisibleTitle,
    [oldestUpdatedSharedSongId]: oldestUpdatedVisibleTitle,
  };

  await page.goto('/admin?e2e-test');

  await pages.adminUnverifiedSongsPage.signIn(adminPanelPassword);
  await pages.adminUnverifiedSongsPage.processRandomUnverifiedSong();
  await expect(pages.songEditBasicInfoPage.editedSongHeader).toBeVisible();

  const firstHeaderText = normalizeWhitespace((await pages.songEditBasicInfoPage.editedSongHeader.textContent()) ?? '');
  const firstSharedSongId = sharedSongIdsInQueue.find(
    (sharedSongId) =>
      firstHeaderText ===
      normalizeWhitespace(`${unverifiedCloudflareSongFixture.artist} - ${visibleTitleBySharedSongId[sharedSongId]}`),
  );
  expect(firstSharedSongId, 'processing the queue should open one of the seeded unverified songs').toBeDefined();

  const secondSharedSongId = sharedSongIdsInQueue.find((sharedSongId) => sharedSongId !== firstSharedSongId)!;

  await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
  await pages.songEditSyncLyricsToVideoPage.deleteAdminUnverifiedSong();

  await pages.songEditBasicInfoPage.expectEditedSongHeaderToBe(
    unverifiedCloudflareSongFixture.artist,
    visibleTitleBySharedSongId[secondSharedSongId],
  );
  await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
  await expect
    .poll(async () => {
      const response = await request.get('/admin/unverified-songs', {
        headers: { 'x-admin-panel-password': adminPanelPassword },
      });
      const songs = (await response.json()) as Array<{ sharedSongId: string }>;

      return songs.some((song) => song.sharedSongId === firstSharedSongId);
    })
    .toBe(false);

  await page.goto('/admin?e2e-test');
  await pages.adminUnverifiedSongsPage.search(visibleTitleBySharedSongId[firstSharedSongId!]);
  await expect(
    pages.adminUnverifiedSongsPage.table.rowWithTitle(visibleTitleBySharedSongId[firstSharedSongId!]),
  ).not.toBeVisible();
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
