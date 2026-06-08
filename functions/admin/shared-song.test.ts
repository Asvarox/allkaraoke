import { reset } from 'cloudflare:test';
import { env as workerEnv } from 'cloudflare:workers';
import { afterEach, describe, expect, it } from 'vitest';
import { getSharedSong, upsertSharedSong } from '../shared-songs-store';
import { generateSharedSongRecord } from '../test-utils';
import { onRequest } from './shared-song';

const createEnv = (kv = workerEnv.SHARED_SONGS_KV) => ({
  ADMIN_PANEL_PASSWORD: 'admin-password',
  SHARED_SONGS_KV: kv,
});

afterEach(async () => {
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

describe('browser shared song admin function', () => {
  it('returns unauthorized for missing or wrong password', async () => {
    const env = createEnv();

    const missingResponse = await onRequest({
      request: new Request('https://example.com/admin/shared-song?id=external-1', {
        method: 'PUT',
        body: JSON.stringify(updatePayload),
      }),
      env,
    } as EventContext<typeof env, string, unknown>);
    const wrongResponse = await onRequest({
      request: new Request('https://example.com/admin/shared-song?id=external-1', {
        method: 'PUT',
        headers: { 'x-admin-panel-password': 'wrong-password' },
        body: JSON.stringify(updatePayload),
      }),
      env,
    } as EventContext<typeof env, string, unknown>);

    expect(missingResponse.status).toBe(401);
    expect(wrongResponse.status).toBe(401);
  });

  it('updates an existing shared song', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    const env = createEnv(kv);
    await upsertSharedSong(kv, generateSharedSongRecord({ externalSongId: 'external-1' }));

    const response = await onRequest({
      request: createRequest('https://example.com/admin/shared-song?id=external-1', updatePayload),
      env,
    } as EventContext<typeof env, string, unknown>);

    await expect(response.json()).resolves.toEqual({ ok: true });
    await expect(getSharedSong(kv, 'external-1')).resolves.toMatchObject({
      externalSongId: 'external-1',
      songId: 'new-song',
      title: 'New Song',
    });
  });

  it('returns not found when updating a missing shared song', async () => {
    const env = createEnv();

    const response = await onRequest({
      request: createRequest('https://example.com/admin/shared-song?id=missing', updatePayload),
      env,
    } as EventContext<typeof env, string, unknown>);

    expect(response.status).toBe(404);
  });
});
