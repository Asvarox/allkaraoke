import { reset } from 'cloudflare:test';
import { env as workerEnv } from 'cloudflare:workers';
import { afterEach, describe, expect, it } from 'vitest';
import {
  getSharedSong,
  listSharedSongs,
  regenerateIndex,
  removeSharedSong,
  updateSharedSong,
  upsertSharedSong,
} from './shared-songs-store';
import { generateSharedSongRecord } from './test-utils';

afterEach(async () => {
  await reset();
});

describe('sharedSongsStore KV behavior', () => {
  it('stores and lists records', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    const record = generateSharedSongRecord();

    await upsertSharedSong(kv, record);

    const list = await listSharedSongs(kv);
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      songId: 'song-1',
      firstSeenAt: 1,
    });
  });

  it('updates a shared song in place while preserving externalSongId', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    await upsertSharedSong(kv, generateSharedSongRecord({ externalSongId: 'external-1', songId: 'old-song' }));

    const updated = await updateSharedSong(kv, 'external-1', {
      songId: 'new-song',
      songTxt: '#TITLE:New Song\nE',
      artist: 'New Artist',
      title: 'New Song',
      language: ['Polish'],
      videoId: 'newVideoId',
    });

    expect(updated).toBe(true);
    expect(await getSharedSong(kv, 'external-1')).toMatchObject({
      externalSongId: 'external-1',
      songId: 'new-song',
      title: 'New Song',
    });
    expect(await getSharedSong(kv, 'new-song')).toBeNull();
    expect(await listSharedSongs(kv)).toEqual([
      expect.objectContaining({
        externalSongId: 'external-1',
        songId: 'new-song',
        title: 'New Song',
        firstSeenAt: 1,
      }),
    ]);
  });

  it('regenerates the index with first seen timestamps', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    await kv.put(
      'shared-song:external-1',
      JSON.stringify(generateSharedSongRecord({ externalSongId: 'external-1', firstSeenAt: 123 })),
    );

    await regenerateIndex(kv);

    expect(await listSharedSongs(kv)).toEqual([
      expect.objectContaining({
        externalSongId: 'external-1',
        firstSeenAt: 123,
      }),
    ]);
  });

  it('regenerates the index from all KV list pages', async () => {
    const records = new Map([
      [
        'shared-song:external-1',
        generateSharedSongRecord({ externalSongId: 'external-1', songId: 'song-1', firstSeenAt: 123 }),
      ],
      [
        'shared-song:external-2',
        generateSharedSongRecord({ externalSongId: 'external-2', songId: 'song-2', firstSeenAt: 456 }),
      ],
    ]);
    let capturedIndex: unknown;
    const fakeKv = {
      list: async ({ cursor, prefix }: KVNamespaceListOptions) => {
        expect(prefix).toBe('shared-song:');
        return cursor
          ? {
              keys: [{ name: 'shared-song:external-2' }],
              list_complete: true,
            }
          : {
              keys: [{ name: 'shared-song:external-1' }],
              list_complete: false,
              cursor: 'next-page',
            };
      },
      get: async (key: string) => records.get(key) ?? null,
      put: async (key: string, value: string) => {
        if (key === 'shared-songs-index') {
          capturedIndex = JSON.parse(value);
        }
      },
    };

    await regenerateIndex(fakeKv as unknown as KVNamespace);

    expect(capturedIndex).toEqual([
      expect.objectContaining({
        externalSongId: 'external-1',
        songId: 'song-1',
        firstSeenAt: 123,
      }),
      expect.objectContaining({
        externalSongId: 'external-2',
        songId: 'song-2',
        firstSeenAt: 456,
      }),
    ]);
  });

  it('fails without writing the index when KV pagination does not advance', async () => {
    let readRecord = false;
    let wroteIndex = false;
    const fakeKv = {
      list: async ({ prefix }: KVNamespaceListOptions) => {
        expect(prefix).toBe('shared-song:');
        return {
          keys: [{ name: 'shared-song:external-1' }],
          list_complete: false,
          cursor: 'same-page',
        };
      },
      get: async () => {
        readRecord = true;
        return null;
      },
      put: async (key: string) => {
        if (key === 'shared-songs-index') {
          wroteIndex = true;
        }
      },
    };

    await expect(regenerateIndex(fakeKv as unknown as KVNamespace)).rejects.toThrow(
      'Shared song index regeneration pagination did not advance at cursor: same-page',
    );
    expect(readRecord).toBe(false);
    expect(wroteIndex).toBe(false);
  });

  it('replaces record on upsert even when hash matches', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;

    await upsertSharedSong(kv, generateSharedSongRecord({ songTxt: 'first', lastSeenAt: 100 }));
    await upsertSharedSong(
      kv,
      generateSharedSongRecord({
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
    const kv = workerEnv.SHARED_SONGS_KV;
    await upsertSharedSong(kv, generateSharedSongRecord());

    const removed = await removeSharedSong(kv, 'song-1');
    const storedRecord = await getSharedSong(kv, 'song-1');
    const list = await listSharedSongs(kv);

    expect(removed).toBe(true);
    expect(storedRecord).toBeNull();
    expect(list).toHaveLength(0);
  });

  it('cleans stale index entries when removing a missing record', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    await kv.put(
      'shared-songs-index',
      JSON.stringify([
        {
          externalSongId: 'missing-id',
          songId: 'missing-song',
          artist: 'Missing Artist',
          title: 'Missing Title',
          language: ['English'],
          videoId: 'missingVideoId',
          firstSeenAt: 123,
        },
      ]),
    );

    const removed = await removeSharedSong(kv, 'missing-id');

    expect(removed).toBe(false);
    expect(await listSharedSongs(kv)).not.toContainEqual(
      expect.objectContaining({
        externalSongId: 'missing-id',
      }),
    );
  });
});
