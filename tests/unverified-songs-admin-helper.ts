import { readFileSync } from 'fs';

import { APIRequestContext, expect, TestInfo } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });
dotenv.config({ path: '.dev.vars', override: true });

export const unverifiedCloudflareSongTxt = readFileSync('./tests/fixtures/songs/shared-cloudflare-e2e.txt', {
  encoding: 'utf-8',
});
const unverifiedSongsAdminToken =
  process.env.UNVERIFIED_SONGS_ADMIN_TOKEN ??
  process.env.SHARED_SONGS_ADMIN_TOKEN ??
  'local-unverified-songs-admin-token';

export const adminPanelPassword = process.env.ADMIN_PANEL_PASSWORD ?? '12345';

export const unverifiedCloudflareSongFixture = {
  songId: 'shared-cloudflare-e2e-song',
  title: 'Cloudflare Shared Unique Song',
  artist: 'Cloudflare Artist',
  language: ['English'],
  videoId: 'koBUXESJZ8g',
};

const adminTokenHeaders = {
  'Content-Type': 'application/json',
  'x-unverified-songs-admin-token': unverifiedSongsAdminToken,
};

export const createSharedSongId = (testInfo: TestInfo) =>
  `admin-${testInfo.project.name}-${testInfo.title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

type UnverifiedSongFixtureOverrides = Partial<typeof unverifiedCloudflareSongFixture> & {
  sharedSongId?: string;
  firstSeenAt?: number;
  updated?: number;
  songTxt?: string;
  sourceUserId?: string;
};

export const upsertUnverifiedSong = async (
  request: APIRequestContext,
  {
    sharedSongId = unverifiedCloudflareSongFixture.songId,
    sourceUserId = 'e2e',
    ...overrides
  }: UnverifiedSongFixtureOverrides = {},
) => {
  const now = Date.now();
  const firstSeenAt = overrides.firstSeenAt ?? now;
  const payload = {
    sharedSongId,
    songId: unverifiedCloudflareSongFixture.songId,
    songTxt: unverifiedCloudflareSongTxt,
    artist: unverifiedCloudflareSongFixture.artist,
    title: unverifiedCloudflareSongFixture.title,
    language: unverifiedCloudflareSongFixture.language,
    videoId: unverifiedCloudflareSongFixture.videoId,
    validatedAt: now,
    firstSeenAt,
    updated: overrides.updated ?? now,
    lastSeenAt: now,
    sourceUserId,
    sourceEventAt: now,
    ...overrides,
  };

  const response = await request.post('/unverified-songs-admin', {
    headers: adminTokenHeaders,
    data: payload,
  });

  await expect(response).toBeOK();
  return payload;
};

export const removeUnverifiedSong = async (request: APIRequestContext, sharedSongId: string) => {
  await request.delete(`/unverified-songs-admin?id=${encodeURIComponent(sharedSongId)}`, {
    headers: adminTokenHeaders,
  });
};
