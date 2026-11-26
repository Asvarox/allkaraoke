import { reset } from 'cloudflare:test';
import { env as workerEnv, exports as workerExports } from 'cloudflare:workers';
import { afterEach, describe, expect, it } from 'vitest';

import { replaceSongQualityFlags, SongQualityFlag } from '../song-quality-flags-store';

afterEach(async () => {
  await reset();
});

const adminRequest = (init: RequestInit = {}) => ({
  ...init,
  headers: { 'x-admin-panel-password': 'admin-password', ...init.headers },
});

const fetchWorker = (url: string, init?: RequestInit) => workerExports.default.fetch(new Request(url, init));

const flag = (overrides: Partial<SongQualityFlag> = {}): SongQualityFlag => ({
  songId: 'song-1',
  artist: 'Artist',
  title: 'Title',
  language: ['English'],
  videoId: 'video-id',
  issues: ['not-in-sync'],
  reportCounts: { 'not-in-sync': 6 },
  players: 40,
  ...overrides,
});

describe('song quality flags admin function', () => {
  it('returns unauthorized for a missing password', async () => {
    const response = await fetchWorker('https://example.com/admin/song-quality-flags');

    expect(response.status).toBe(401);
  });

  it('lists flagged songs', async () => {
    await replaceSongQualityFlags(workerEnv.SHARED_SONGS_KV, [
      flag(),
      flag({ songId: 'song-2', issues: ['too-loud'] }),
    ]);

    const response = await fetchWorker('https://example.com/admin/song-quality-flags', adminRequest());
    const body = await response.json<{ songs: SongQualityFlag[] }>();

    expect(body.songs.map((song) => [song.songId, song.issues])).toEqual([
      ['song-1', ['not-in-sync']],
      ['song-2', ['too-loud']],
    ]);
  });

  it('returns an empty list when nothing was flagged yet', async () => {
    const response = await fetchWorker('https://example.com/admin/song-quality-flags', adminRequest());

    await expect(response.json()).resolves.toEqual({ generatedAt: 0, songs: [] });
  });

  it('dismisses a single flagged song', async () => {
    await replaceSongQualityFlags(workerEnv.SHARED_SONGS_KV, [flag(), flag({ songId: 'song-2' })]);

    const response = await fetchWorker(
      'https://example.com/admin/song-quality-flags?id=song-1',
      adminRequest({ method: 'DELETE' }),
    );
    expect(response.status).toBe(200);

    const missingResponse = await fetchWorker(
      'https://example.com/admin/song-quality-flags?id=song-1',
      adminRequest({ method: 'DELETE' }),
    );
    expect(missingResponse.status).toBe(404);

    const list = await (
      await fetchWorker('https://example.com/admin/song-quality-flags', adminRequest())
    ).json<{ songs: SongQualityFlag[] }>();
    expect(list.songs.map((song) => song.songId)).toEqual(['song-2']);
  });

  it('remembers dismissals for the weekly job', async () => {
    await replaceSongQualityFlags(workerEnv.SHARED_SONGS_KV, [flag()]);
    const before = Date.now();

    await fetchWorker('https://example.com/admin/song-quality-flags?id=song-1', adminRequest({ method: 'DELETE' }));

    const response = await fetchWorker('https://example.com/song-quality-flags-admin', {
      headers: { 'x-unverified-songs-admin-token': 'ci-token' },
    });
    const { dismissals } = await response.json<{ dismissals: Record<string, number> }>();

    expect(Object.keys(dismissals)).toEqual(['song-1']);
    expect(dismissals['song-1']).toBeGreaterThanOrEqual(before);
  });

  it('keeps duration-shift flags when the weekly job replaces player reports', async () => {
    const ciRequest = (method: string, songs: SongQualityFlag[]) =>
      fetchWorker('https://example.com/song-quality-flags-admin', {
        method,
        headers: { 'x-unverified-songs-admin-token': 'ci-token' },
        body: JSON.stringify({ songs }),
      });
    const durationShift = { previousDuration: 200, currentDuration: 205, offset: null, detectedAt: 1 };

    await ciRequest('PUT', [flag(), flag({ songId: 'song-2', issues: ['too-loud'] })]);
    await ciRequest('POST', [
      flag({ issues: ['duration-shift'], reportCounts: {}, durationShift }),
      flag({ songId: 'song-3', issues: ['duration-shift'], reportCounts: {}, durationShift }),
    ]);
    await ciRequest('PUT', [flag({ songId: 'song-2', issues: ['too-quiet'], reportCounts: { 'too-quiet': 7 } })]);

    const list = await (
      await fetchWorker('https://example.com/admin/song-quality-flags', adminRequest())
    ).json<{ songs: SongQualityFlag[] }>();

    expect(list.songs.map((song) => [song.songId, song.issues, song.durationShift?.currentDuration]).sort()).toEqual([
      ['song-1', ['duration-shift'], 205],
      ['song-2', ['too-quiet'], undefined],
      ['song-3', ['duration-shift'], 205],
    ]);
  });

  it('shows the weekly report metadata for a song that also has a duration shift, and dismisses both', async () => {
    const ciRequest = (method: string, songs: SongQualityFlag[]) =>
      fetchWorker('https://example.com/song-quality-flags-admin', {
        method,
        headers: { 'x-unverified-songs-admin-token': 'ci-token' },
        body: JSON.stringify({ songs }),
      });
    const durationShift = { previousDuration: 200, currentDuration: 205, offset: 5, detectedAt: 1 };
    const listFlags = async () =>
      (
        await (
          await fetchWorker('https://example.com/admin/song-quality-flags', adminRequest())
        ).json<{
          songs: SongQualityFlag[];
        }>()
      ).songs;

    await ciRequest('POST', [
      flag({ videoId: 'old-video', issues: ['duration-shift'], reportCounts: {}, durationShift }),
    ]);
    await ciRequest('PUT', [flag({ videoId: 'new-video', players: 40 })]);

    expect(await listFlags()).toMatchObject([
      { songId: 'song-1', videoId: 'new-video', players: 40, issues: ['not-in-sync', 'duration-shift'], durationShift },
    ]);

    await fetchWorker('https://example.com/admin/song-quality-flags?id=song-1', adminRequest({ method: 'DELETE' }));

    expect(await listFlags()).toEqual([]);
  });

  it('keeps the instrumental flag apart from the original and dismisses each on its own', async () => {
    const durationShift = { previousDuration: 200, currentDuration: 205, offset: null, detectedAt: 1 };
    const listFlags = async () =>
      (
        await (
          await fetchWorker('https://example.com/admin/song-quality-flags', adminRequest())
        ).json<{ songs: SongQualityFlag[] }>()
      ).songs.map((song) => [song.songId, song.version ?? 'original', song.videoId, song.issues]);

    await replaceSongQualityFlags(workerEnv.SHARED_SONGS_KV, [
      flag(),
      flag({ version: 'instrumental', videoId: 'instrumental-video', issues: ['too-loud'] }),
    ]);
    await fetchWorker('https://example.com/song-quality-flags-admin', {
      method: 'POST',
      headers: { 'x-unverified-songs-admin-token': 'ci-token' },
      body: JSON.stringify({
        songs: [
          flag({
            version: 'instrumental',
            videoId: 'instrumental-video',
            issues: ['duration-shift'],
            reportCounts: {},
            durationShift,
          }),
        ],
      }),
    });

    expect(await listFlags()).toEqual([
      ['song-1', 'original', 'video-id', ['not-in-sync']],
      ['song-1', 'instrumental', 'instrumental-video', ['too-loud', 'duration-shift']],
    ]);

    await fetchWorker(
      'https://example.com/admin/song-quality-flags?id=song-1&version=instrumental',
      adminRequest({ method: 'DELETE' }),
    );
    expect(await listFlags()).toEqual([['song-1', 'original', 'video-id', ['not-in-sync']]]);

    const { dismissals } = await (
      await fetchWorker('https://example.com/song-quality-flags-admin', {
        headers: { 'x-unverified-songs-admin-token': 'ci-token' },
      })
    ).json<{ dismissals: Record<string, number> }>();
    expect(Object.keys(dismissals)).toEqual(['song-1:instrumental']);
  });

  it('rejects CI updates without the admin token', async () => {
    const response = await fetchWorker('https://example.com/song-quality-flags-admin', {
      method: 'PUT',
      body: JSON.stringify({ songs: [flag()] }),
    });

    expect(response.status).toBe(401);
  });
});
