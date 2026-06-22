import { reset } from 'cloudflare:test';
import { env as workerEnv } from 'cloudflare:workers';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateUnverifiedSongRecord } from '../test-utils';
import { getUnverifiedSong, upsertUnverifiedSong } from '../unverified-songs-store';
import { onRequest } from './unverified-song';

const createEnv = (kv = workerEnv.SHARED_SONGS_KV) => ({
  ADMIN_PANEL_PASSWORD: 'admin-password',
  SHARED_SONGS_KV: kv,
});

afterEach(async () => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  await reset();
});

const createRequest = (url: string, body: unknown) =>
  new Request(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-panel-password': 'admin-password',
    },
    body: JSON.stringify(body),
  });

const updatePayload = {
  songId: 'new-song',
  songTxt: '#TITLE:New Song\nE',
  artist: 'New Artist',
  title: 'New Song',
  language: ['Polish'],
  videoId: 'newVideoId',
};

describe('browser unverified song admin function', () => {
  it('returns unauthorized for missing or wrong password', async () => {
    const env = createEnv();

    const missingResponse = await onRequest({
      request: new Request('https://example.com/admin/unverified-song?id=external-1', {
        method: 'PUT',
        body: JSON.stringify(updatePayload),
      }),
      env,
    } as EventContext<typeof env, string, unknown>);
    const wrongResponse = await onRequest({
      request: new Request('https://example.com/admin/unverified-song?id=external-1', {
        method: 'PUT',
        headers: { 'x-admin-panel-password': 'wrong-password' },
        body: JSON.stringify(updatePayload),
      }),
      env,
    } as EventContext<typeof env, string, unknown>);

    expect(missingResponse.status).toBe(401);
    expect(wrongResponse.status).toBe(401);
  });

  it('updates an existing unverified song', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    const env = createEnv(kv);
    await upsertUnverifiedSong(kv, generateUnverifiedSongRecord({ sharedSongId: 'external-1' }));
    vi.useFakeTimers();
    vi.setSystemTime(999);

    const response = await onRequest({
      request: createRequest('https://example.com/admin/unverified-song?id=external-1', updatePayload),
      env,
    } as EventContext<typeof env, string, unknown>);

    await expect(response.json()).resolves.toEqual({ ok: true });
    await expect(getUnverifiedSong(kv, 'external-1')).resolves.toMatchObject({
      sharedSongId: 'external-1',
      songId: 'new-song',
      title: 'New Song',
      updated: 999,
    });
  });

  it('returns not found when updating a missing unverified song', async () => {
    const env = createEnv();

    const response = await onRequest({
      request: createRequest('https://example.com/admin/unverified-song?id=missing', updatePayload),
      env,
    } as EventContext<typeof env, string, unknown>);

    expect(response.status).toBe(404);
  });
});
