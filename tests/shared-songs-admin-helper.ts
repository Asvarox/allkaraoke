import { APIRequestContext, expect, TestInfo } from '@playwright/test';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });
dotenv.config({ path: '.dev.vars', override: true });

const songTxt = readFileSync('./tests/fixtures/songs/shared-cloudflare-e2e.txt', { encoding: 'utf-8' });
const sharedSongsAdminToken = process.env.SHARED_SONGS_ADMIN_TOKEN ?? 'local-shared-songs-admin-token';

export const adminPanelPassword = process.env.ADMIN_PANEL_PASSWORD ?? '12345';

export const sharedCloudflareSongFixture = {
  songId: 'shared-cloudflare-e2e-song',
  title: 'Cloudflare Shared Unique Song',
  artist: 'Cloudflare Artist',
  language: ['English'],
  videoId: 'koBUXESJZ8g',
};

const adminTokenHeaders = {
  'Content-Type': 'application/json',
  'x-shared-songs-admin-token': sharedSongsAdminToken,
};

export const createExternalSongId = (testInfo: TestInfo) =>
  `admin-${testInfo.project.name}-${testInfo.title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

type SharedSongFixtureOverrides = Partial<typeof sharedCloudflareSongFixture> & {
  externalSongId?: string;
  firstSeenAt?: number;
  sourceUserId?: string;
};

export const upsertSharedSong = async (
  request: APIRequestContext,
  {
    externalSongId = sharedCloudflareSongFixture.songId,
    sourceUserId = 'e2e',
    ...overrides
  }: SharedSongFixtureOverrides = {},
) => {
  const now = Date.now();
  const payload = {
    externalSongId,
    songId: sharedCloudflareSongFixture.songId,
    songTxt,
    artist: sharedCloudflareSongFixture.artist,
    title: sharedCloudflareSongFixture.title,
    language: sharedCloudflareSongFixture.language,
    videoId: sharedCloudflareSongFixture.videoId,
    verifiedAt: now,
    firstSeenAt: now,
    lastSeenAt: now,
    sourceUserId,
    sourceEventAt: now,
    ...overrides,
  };

  const response = await request.post('/shared-songs-admin', {
    headers: adminTokenHeaders,
    data: payload,
  });

  await expect(response).toBeOK();
  return payload;
};

export const removeSharedSong = async (request: APIRequestContext, externalSongId: string) => {
  await request.delete(`/shared-songs-admin?id=${encodeURIComponent(externalSongId)}`, {
    headers: adminTokenHeaders,
  });
};
