import { reset } from 'cloudflare:test';
import { env as workerEnv } from 'cloudflare:workers';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateUnverifiedSongRecord } from './test-utils';
import {
  getUnverifiedSong,
  listUnverifiedSongs,
  regenerateIndex,
  removeUnverifiedSong,
  updateUnverifiedSong,
  upsertUnverifiedSong,
} from './unverified-songs-store';

afterEach(async () => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  await reset();
});

describe('unverifiedSongsStore KV behavior', () => {
  it('stores and lists records', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    const record = generateUnverifiedSongRecord();

    await upsertUnverifiedSong(kv, record);

    const list = await listUnverifiedSongs(kv);
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      songId: 'song-1',
      firstSeenAt: 1,
      updated: 1,
    });
  });

  it('updates an unverified song in place while preserving sharedSongId', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    await upsertUnverifiedSong(kv, generateUnverifiedSongRecord({ sharedSongId: 'external-1', songId: 'old-song' }));
    vi.useFakeTimers();
    vi.setSystemTime(777);

    const updated = await updateUnverifiedSong(kv, 'external-1', {
      songId: 'new-song',
      songTxt: '#TITLE:New Song\nE',
      artist: 'New Artist',
      title: 'New Song',
      language: ['Polish'],
      videoId: 'newVideoId',
    });

    expect(updated).toBe(true);
    expect(await getUnverifiedSong(kv, 'external-1')).toMatchObject({
      sharedSongId: 'external-1',
      songId: 'new-song',
      title: 'New Song',
      updated: 777,
      lastSeenAt: 777,
    });
    expect(await getUnverifiedSong(kv, 'new-song')).toBeNull();
    expect(await listUnverifiedSongs(kv)).toEqual([
      expect.objectContaining({
        sharedSongId: 'external-1',
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
      JSON.stringify(generateUnverifiedSongRecord({ sharedSongId: 'external-1', firstSeenAt: 123, updated: 456 })),
    );

    await regenerateIndex(kv);

    expect(await listUnverifiedSongs(kv)).toEqual([
      expect.objectContaining({
        sharedSongId: 'external-1',
        firstSeenAt: 123,
        updated: 456,
      }),
    ]);
  });

  it('falls back to firstSeenAt when regenerated index record has no updated timestamp', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    const legacyRecord = generateUnverifiedSongRecord({ sharedSongId: 'external-1', firstSeenAt: 123 });
    delete (legacyRecord as Partial<typeof legacyRecord>).updated;
    await kv.put('shared-song:external-1', JSON.stringify(legacyRecord));

    await regenerateIndex(kv);

    expect(await listUnverifiedSongs(kv)).toEqual([
      expect.objectContaining({
        sharedSongId: 'external-1',
        firstSeenAt: 123,
        updated: 123,
      }),
    ]);
  });

  it('replaces record on upsert even when hash matches', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;

    await upsertUnverifiedSong(kv, generateUnverifiedSongRecord({ songTxt: 'first', lastSeenAt: 100 }));
    await upsertUnverifiedSong(
      kv,
      generateUnverifiedSongRecord({
        songTxt: 'second',
        lastSeenAt: 200,
        sourceEventAt: 300,
        sourceUserId: 'user-2',
      }),
    );

    const storedRecord = await getUnverifiedSong(kv, 'song-1');
    expect(storedRecord?.songTxt).toBe('second');
    expect(storedRecord?.lastSeenAt).toBe(200);
    expect(storedRecord?.sourceEventAt).toBe(300);
    expect(storedRecord?.sourceUserId).toBe('user-2');
  });

  it('removes record from storage and index', async () => {
    const kv = workerEnv.SHARED_SONGS_KV;
    await upsertUnverifiedSong(kv, generateUnverifiedSongRecord());

    const removed = await removeUnverifiedSong(kv, 'song-1');
    const storedRecord = await getUnverifiedSong(kv, 'song-1');
    const list = await listUnverifiedSongs(kv);

    expect(removed).toBe(true);
    expect(storedRecord).toBeNull();
    expect(list).toHaveLength(0);
  });
});
