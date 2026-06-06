import { describe, expect, it } from 'vitest';
import {
  getSharedSong,
  listSharedSongs,
  removeSharedSong,
  SharedSongRecord,
  upsertSharedSong,
} from './shared-songs-store';

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
  externalSongId: 'song-1',
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

describe('sharedSongsStore KV behavior', () => {
  it('stores and lists records', async () => {
    const kv = new MockKVNamespace();
    const record = createRecord();

    await upsertSharedSong(kv, record);

    const list = await listSharedSongs(kv);
    expect(list).toHaveLength(1);
    expect(list[0].songId).toBe('song-1');
  });

  it('replaces record on upsert even when hash matches', async () => {
    const kv = new MockKVNamespace();

    await upsertSharedSong(kv, createRecord({ songTxt: 'first', lastSeenAt: 100 }));
    await upsertSharedSong(
      kv,
      createRecord({
        songTxt: 'second',
        lastSeenAt: 200,
        sourceEventAt: 300,
        sourceUserId: 'user-2',
      }),
    );

    const storedRecord = await getSharedSong(kv, 'song-1');
    expect(storedRecord?.songTxt).toBe('second');
    expect(storedRecord?.lastSeenAt).toBe(200);
    expect(storedRecord?.sourceEventAt).toBe(300);
    expect(storedRecord?.sourceUserId).toBe('user-2');
  });

  it('removes record from storage and index', async () => {
    const kv = new MockKVNamespace();
    await upsertSharedSong(kv, createRecord());

    const removed = await removeSharedSong(kv, 'song-1');
    const storedRecord = await getSharedSong(kv, 'song-1');
    const list = await listSharedSongs(kv);

    expect(removed).toBe(true);
    expect(storedRecord).toBeNull();
    expect(list).toHaveLength(0);
  });
});
