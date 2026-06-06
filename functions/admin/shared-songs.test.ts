import { describe, expect, it } from 'vitest';
import { SharedSongRecord, upsertSharedSong } from '../shared-songs-store';
import { onRequest } from './shared-songs';

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
  ADMIN_PANEL_PASSWORD: 'admin-password',
  SHARED_SONGS_KV: kv,
});

const createRequest = (url: string, init: RequestInit = {}) =>
  new Request(url, {
    ...init,
    headers: {
      'x-admin-panel-password': 'admin-password',
      ...init.headers,
    },
  });

describe('browser shared songs admin function', () => {
  it('returns unauthorized for missing or wrong password', async () => {
    const env = createEnv();

    const missingResponse = await onRequest({
      request: new Request('https://example.com/admin/shared-songs'),
      env,
    } as EventContext<typeof env, string, unknown>);
    const wrongResponse = await onRequest({
      request: createRequest('https://example.com/admin/shared-songs', {
        headers: { 'x-admin-panel-password': 'wrong-password' },
      }),
      env,
    } as EventContext<typeof env, string, unknown>);

    expect(missingResponse.status).toBe(401);
    expect(wrongResponse.status).toBe(401);
  });

  it('returns list data', async () => {
    const kv = new MockKVNamespace();
    const env = createEnv(kv);
    await upsertSharedSong(kv, createRecord());

    const response = await onRequest({
      request: createRequest('https://example.com/admin/shared-songs'),
      env,
    } as EventContext<typeof env, string, unknown>);

    await expect(response.json()).resolves.toEqual([
      expect.objectContaining({
        externalSongId: 'external-1',
        songId: 'song-1',
        artist: 'Artist',
      }),
    ]);
  });

  it('deletes a shared song by external id', async () => {
    const kv = new MockKVNamespace();
    const env = createEnv(kv);
    await upsertSharedSong(kv, createRecord());

    const response = await onRequest({
      request: createRequest('https://example.com/admin/shared-songs?id=external-1', { method: 'DELETE' }),
      env,
    } as EventContext<typeof env, string, unknown>);

    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('returns not found when deleting a missing shared song', async () => {
    const env = createEnv();

    const response = await onRequest({
      request: createRequest('https://example.com/admin/shared-songs?id=missing', { method: 'DELETE' }),
      env,
    } as EventContext<typeof env, string, unknown>);

    expect(response.status).toBe(404);
  });

  it('regenerates the shared songs index', async () => {
    const kv = new MockKVNamespace();
    const env = createEnv(kv);
    await kv.put('shared-song:external-1', JSON.stringify(createRecord()));

    const response = await onRequest({
      request: createRequest('https://example.com/admin/shared-songs', { method: 'PUT' }),
      env,
    } as EventContext<typeof env, string, unknown>);

    await expect(response.json()).resolves.toEqual({ ok: true });

    const listResponse = await onRequest({
      request: createRequest('https://example.com/admin/shared-songs'),
      env,
    } as EventContext<typeof env, string, unknown>);

    await expect(listResponse.json()).resolves.toEqual([
      expect.objectContaining({
        externalSongId: 'external-1',
      }),
    ]);
  });
});
