import { reset } from 'cloudflare:test';
import { env as workerEnv, exports as workerExports } from 'cloudflare:workers';
import { afterEach, describe, expect, it } from 'vitest';
import { generateUnverifiedSongRecord } from '../test-utils';
import { upsertUnverifiedSong } from '../unverified-songs-store';

afterEach(async () => {
  await reset();
});

const createRequest = (init: RequestInit = {}) => ({
  ...init,
  headers: {
    'x-admin-panel-password': 'admin-password',
    ...init.headers,
  },
});

const fetchWorker = (url: string, init?: RequestInit) => workerExports.default.fetch(new Request(url, init));

describe('browser unverified songs admin function', () => {
  it('returns unauthorized for missing or wrong password', async () => {
    const missingResponse = await fetchWorker('https://example.com/admin/unverified-songs');
    const wrongResponse = await fetchWorker(
      'https://example.com/admin/unverified-songs',
      createRequest({
        headers: { 'x-admin-panel-password': 'wrong-password' },
      }),
    );

    expect(missingResponse.status).toBe(401);
    expect(wrongResponse.status).toBe(401);
  });

  it('returns list data', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    await upsertUnverifiedSong(
      kv,
      generateUnverifiedSongRecord({ sharedSongId: 'external-1', firstSeenAt: 123, updated: 123 }),
    );

    const response = await fetchWorker('https://example.com/admin/unverified-songs', createRequest());

    await expect(response.json()).resolves.toEqual([
      expect.objectContaining({
        sharedSongId: 'external-1',
        songId: 'song-1',
        artist: 'Artist',
        firstSeenAt: 123,
        updated: 123,
      }),
    ]);
  });

  it('deletes an unverified song by external id', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    await upsertUnverifiedSong(kv, generateUnverifiedSongRecord({ sharedSongId: 'external-1' }));

    const response = await fetchWorker(
      'https://example.com/admin/unverified-songs?id=external-1',
      createRequest({ method: 'DELETE' }),
    );

    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('returns not found when deleting a missing unverified song', async () => {
    const response = await fetchWorker(
      'https://example.com/admin/unverified-songs?id=missing',
      createRequest({ method: 'DELETE' }),
    );

    expect(response.status).toBe(404);
  });

  it('regenerates the unverified songs index', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    await kv.put(
      'shared-song:external-1',
      JSON.stringify(generateUnverifiedSongRecord({ sharedSongId: 'external-1', firstSeenAt: 123, updated: 123 })),
    );

    const response = await fetchWorker('https://example.com/admin/unverified-songs', createRequest({ method: 'PUT' }));

    await expect(response.json()).resolves.toEqual({ ok: true });

    const listResponse = await fetchWorker('https://example.com/admin/unverified-songs', createRequest());

    await expect(listResponse.json()).resolves.toEqual([
      expect.objectContaining({
        sharedSongId: 'external-1',
        firstSeenAt: 123,
        updated: 123,
      }),
    ]);
  });

  it('falls back to firstSeenAt when regenerating an index entry without updated', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    const legacyRecord = generateUnverifiedSongRecord({ sharedSongId: 'external-1', firstSeenAt: 123 });
    delete (legacyRecord as Partial<typeof legacyRecord>).updated;
    await kv.put('shared-song:external-1', JSON.stringify(legacyRecord));

    const response = await fetchWorker('https://example.com/admin/unverified-songs', createRequest({ method: 'PUT' }));

    await expect(response.json()).resolves.toEqual({ ok: true });

    const listResponse = await fetchWorker('https://example.com/admin/unverified-songs', createRequest());

    await expect(listResponse.json()).resolves.toEqual([
      expect.objectContaining({
        sharedSongId: 'external-1',
        firstSeenAt: 123,
        updated: 123,
      }),
    ]);
  });
});
