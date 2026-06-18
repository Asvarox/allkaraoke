import { reset } from 'cloudflare:test';
import { env as workerEnv } from 'cloudflare:workers';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
  vi.useRealTimers();
  vi.restoreAllMocks();
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
      updated: 1,
    });
  });

  it('updates a shared song in place while preserving externalSongId', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    await upsertSharedSong(kv, generateSharedSongRecord({ externalSongId: 'external-1', songId: 'old-song' }));
    vi.useFakeTimers();
    vi.setSystemTime(777);

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
      updated: 777,
      lastSeenAt: 777,
    });
    expect(await getSharedSong(kv, 'new-song')).toBeNull();
    expect(await listSharedSongs(kv)).toEqual([
      expect.objectContaining({
        externalSongId: 'external-1',
        songId: 'new-song',
        title: 'New Song',
        firstSeenAt: 1,
        updated: 777,
      }),
    ]);
  });

  it('regenerates the index from stored records', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    await kv.put(
      'shared-song:external-1',
      JSON.stringify(generateSharedSongRecord({ externalSongId: 'external-1', firstSeenAt: 123, updated: 456 })),
    );

    await regenerateIndex(kv);

    expect(await listSharedSongs(kv)).toEqual([
      expect.objectContaining({
        externalSongId: 'external-1',
        firstSeenAt: 123,
        updated: 456,
      }),
    ]);
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
});
