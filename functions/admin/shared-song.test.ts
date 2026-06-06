import { describe, expect, it } from 'vitest';
import { getSharedSong, SharedSongRecord, upsertSharedSong } from '../shared-songs-store';
import { onRequest } from './shared-song';

class MockKVNamespace implements KVNamespace {
  private storage = new Map<string, string>();

  get(key: string, type: 'json'): Promise<any | null>;
  get(key: string, type?: 'text'): Promise<string | null>;
  async get(key: string, type: 'json' | 'text' = 'text') {
    const value = this.storage.get(key);
    if (!value) return null;
    return type === 'json' ? JSON.parse(value) : value;
  }

  async put(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async list<Metadata = unknown>(options?: KVListOptions): Promise<KVNamespaceListResult<Metadata>> {
    const prefix = options?.prefix ?? '';
    const keys = [...this.storage.keys()]
      .filter((key) => key.startsWith(prefix))
      .map((key) => ({ name: key, expiration: undefined, metadata: undefined as Metadata | undefined }));

    return {
      list_complete: true,
      cursor: '',
      keys,
      cacheStatus: null,
    };
  }

  getWithMetadata(): Promise<any> {
    throw new Error('Not implemented in test mock');
  }
}

const createRecord = (overrides: Partial<SharedSongRecord> = {}): SharedSongRecord => ({
  externalSongId: 'external-1',
  songId: 'song-1',
  songTxt: '#TITLE:Song\nE',
  artist: 'Artist',
  title: 'Title',
  language: ['English'],
  videoId: 'koBUXESJZ8g',
  verifiedAt: 1,
  firstSeenAt: 1,
  lastSeenAt: 1,
  sourceUserId: 'user-1',
  sourceEventAt: 1,
  ...overrides,
});

const createEnv = (kv = new MockKVNamespace()) => ({
  SHARED_SONGS_ADMIN_PASSWORD: 'admin-password',
  SHARED_SONGS_KV: kv,
});

const createRequest = (url: string, body: unknown) =>
  new Request(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-shared-songs-admin-password': 'admin-password',
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
        headers: { 'x-shared-songs-admin-password': 'wrong-password' },
        body: JSON.stringify(updatePayload),
      }),
      env,
    } as EventContext<typeof env, string, unknown>);

    expect(missingResponse.status).toBe(401);
    expect(wrongResponse.status).toBe(401);
  });

  it('updates an existing shared song', async () => {
    const kv = new MockKVNamespace();
    const env = createEnv(kv);
    await upsertSharedSong(kv, createRecord());

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
