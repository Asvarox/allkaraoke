import { reset } from 'cloudflare:test';
import { env as workerEnv, exports as workerExports } from 'cloudflare:workers';
import { afterEach, describe, expect, it } from 'vitest';
import { upsertSharedSong } from '../shared-songs-store';
import { generateSharedSongRecord } from '../test-utils';

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

describe('browser shared songs admin function', () => {
  it('returns unauthorized for missing or wrong password', async () => {
    const missingResponse = await fetchWorker('https://example.com/admin/shared-songs');
    const wrongResponse = await fetchWorker(
      'https://example.com/admin/shared-songs',
      createRequest({
        headers: { 'x-admin-panel-password': 'wrong-password' },
      }),
    );

    expect(missingResponse.status).toBe(401);
    expect(wrongResponse.status).toBe(401);
  });

  it('returns list data', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    await upsertSharedSong(kv, generateSharedSongRecord({ externalSongId: 'external-1' }));

    const response = await fetchWorker('https://example.com/admin/shared-songs', createRequest());

    await expect(response.json()).resolves.toEqual([
      expect.objectContaining({
        externalSongId: 'external-1',
        songId: 'song-1',
        artist: 'Artist',
      }),
    ]);
  });

  it('deletes a shared song by external id', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    await upsertSharedSong(kv, generateSharedSongRecord({ externalSongId: 'external-1' }));

    const response = await fetchWorker(
      'https://example.com/admin/shared-songs?id=external-1',
      createRequest({ method: 'DELETE' }),
    );

    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('returns not found when deleting a missing shared song', async () => {
    const response = await fetchWorker(
      'https://example.com/admin/shared-songs?id=missing',
      createRequest({ method: 'DELETE' }),
    );

    expect(response.status).toBe(404);
  });

  it('regenerates the shared songs index', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    await kv.put('shared-song:external-1', JSON.stringify(generateSharedSongRecord({ externalSongId: 'external-1' })));

    const response = await fetchWorker('https://example.com/admin/shared-songs', createRequest({ method: 'PUT' }));

    await expect(response.json()).resolves.toEqual({ ok: true });

    const listResponse = await fetchWorker('https://example.com/admin/shared-songs', createRequest());

    await expect(listResponse.json()).resolves.toEqual([
      expect.objectContaining({
        externalSongId: 'external-1',
      }),
    ]);
  });
});
