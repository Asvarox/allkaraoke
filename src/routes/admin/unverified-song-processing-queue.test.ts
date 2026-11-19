import {
  buildAdminReviewSongProcessingUrl,
  getNextAdminReviewSongProcessingUrl,
  getRandomAdminReviewSong,
} from './unverified-song-processing-queue';
import { AdminReviewSong, toAdminReviewSongs } from './unverified-songs-admin-api';
import { markAdminSongVerified } from './verified-songs-counter';

const pendingSaveIds = vi.hoisted(() => ({ value: [] as string[] }));

vi.mock('./background-song-save', () => ({
  getPendingAdminUnverifiedSongSaveIds: () => pendingSaveIds.value,
}));

beforeEach(() => {
  localStorage.clear();
  pendingSaveIds.value = [];
});

const makeSong = (overrides: Partial<AdminReviewSong> & Pick<AdminReviewSong, 'sharedSongId'>): AdminReviewSong => ({
  key: overrides.sharedSongId!,
  songId: overrides.sharedSongId!,
  reasons: ['unverified'],
  artist: 'Artist',
  title: 'Title',
  language: ['English'],
  videoId: 'video-id',
  firstSeenAt: 0,
  updated: 0,
  ...overrides,
});

describe('getRandomAdminReviewSong', () => {
  it('returns undefined when there are no candidates', () => {
    expect(getRandomAdminReviewSong([])).toBeUndefined();
  });

  it('excludes the current song from the candidates regardless of the random draw', () => {
    const current = makeSong({ sharedSongId: 'current' });
    const other = makeSong({ sharedSongId: 'other' });

    for (const randomValue of [0, 0.25, 0.5, 0.75, 0.999]) {
      vi.spyOn(Math, 'random').mockReturnValue(randomValue);
      expect(getRandomAdminReviewSong([current, other], 'current')?.sharedSongId).toBe('other');
    }

    vi.restoreAllMocks();
  });

  it('excludes songs already verified today and songs still being saved', () => {
    const verified = makeSong({ sharedSongId: 'verified' });
    const saving = makeSong({ sharedSongId: 'saving' });
    const other = makeSong({ sharedSongId: 'other' });
    markAdminSongVerified('verified');
    pendingSaveIds.value = ['saving'];

    for (const randomValue of [0, 0.5, 0.999]) {
      vi.spyOn(Math, 'random').mockReturnValue(randomValue);
      expect(getRandomAdminReviewSong([verified, saving, other])?.sharedSongId).toBe('other');
    }

    expect(getRandomAdminReviewSong([verified, saving])).toBeUndefined();

    vi.restoreAllMocks();
  });

  it('weights the oldest submission 3x over the newest submission', () => {
    const oldest = makeSong({ sharedSongId: 'oldest', firstSeenAt: 0 });
    const newest = makeSong({ sharedSongId: 'newest', firstSeenAt: 100 });
    const songs = [oldest, newest];

    // totalWeight = 3 (oldest) + 1 (newest) = 4, so the oldest/newest split falls at random === 0.75.
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(getRandomAdminReviewSong(songs)?.sharedSongId).toBe('oldest');

    vi.spyOn(Math, 'random').mockReturnValue(0.7499);
    expect(getRandomAdminReviewSong(songs)?.sharedSongId).toBe('oldest');

    vi.spyOn(Math, 'random').mockReturnValue(0.75);
    expect(getRandomAdminReviewSong(songs)?.sharedSongId).toBe('newest');

    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(getRandomAdminReviewSong(songs)?.sharedSongId).toBe('newest');

    vi.restoreAllMocks();
  });

  it('weights submissions between the oldest and newest linearly by firstSeenAt', () => {
    const oldest = makeSong({ sharedSongId: 'oldest', firstSeenAt: 0 });
    const middle = makeSong({ sharedSongId: 'middle', firstSeenAt: 50 });
    const newest = makeSong({ sharedSongId: 'newest', firstSeenAt: 100 });
    const songs = [oldest, middle, newest];

    // weights = [3, 2, 1], totalWeight = 6 -> boundaries at random === 0.5 and random === 5/6.
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(getRandomAdminReviewSong(songs)?.sharedSongId).toBe('oldest');

    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(getRandomAdminReviewSong(songs)?.sharedSongId).toBe('middle');

    vi.spyOn(Math, 'random').mockReturnValue(5 / 6);
    expect(getRandomAdminReviewSong(songs)?.sharedSongId).toBe('newest');

    vi.restoreAllMocks();
  });

  it('falls back to a uniform distribution when all submissions have the same firstSeenAt', () => {
    const first = makeSong({ sharedSongId: 'first', firstSeenAt: 42 });
    const second = makeSong({ sharedSongId: 'second', firstSeenAt: 42 });
    const songs = [first, second];

    vi.spyOn(Math, 'random').mockReturnValue(0.49);
    expect(getRandomAdminReviewSong(songs)?.sharedSongId).toBe('first');

    vi.spyOn(Math, 'random').mockReturnValue(0.51);
    expect(getRandomAdminReviewSong(songs)?.sharedSongId).toBe('second');

    vi.restoreAllMocks();
  });
});

const makeReportedSong = (songId: string, reasons: AdminReviewSong['reasons']): AdminReviewSong => ({
  key: songId,
  songId,
  artist: 'Artist',
  title: 'Title',
  language: ['English'],
  videoId: 'video-id',
  reasons,
});

describe('getRandomAdminReviewSong pools', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('draws unverified songs first, then not-in-sync, then wrong volume', () => {
    const unverified = makeSong({ sharedSongId: 'unverified' });
    const notInSync = makeReportedSong('not-in-sync', ['not-in-sync']);
    const tooLoud = makeReportedSong('too-loud', ['too-loud']);
    const tooQuiet = makeReportedSong('too-quiet', ['too-quiet']);

    for (const randomValue of [0, 0.5, 0.999]) {
      vi.spyOn(Math, 'random').mockReturnValue(randomValue);
      expect(getRandomAdminReviewSong([tooLoud, notInSync, unverified])?.key).toBe('unverified');
      expect(getRandomAdminReviewSong([tooLoud, notInSync, tooQuiet])?.key).toBe('not-in-sync');
    }

    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(getRandomAdminReviewSong([tooLoud, tooQuiet])?.key).toBe('too-loud');
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    expect(getRandomAdminReviewSong([tooLoud, tooQuiet])?.key).toBe('too-quiet');
  });

  it('moves on to the next pool once the previous one is processed', () => {
    const notInSync = makeReportedSong('not-in-sync', ['not-in-sync']);
    const tooLoud = makeReportedSong('too-loud', ['too-loud']);
    markAdminSongVerified('not-in-sync');

    expect(getRandomAdminReviewSong([notInSync, tooLoud])?.key).toBe('too-loud');
  });

  it('puts a song with several reasons in its highest priority pool', () => {
    const both = makeReportedSong('both', ['too-quiet', 'not-in-sync']);
    const tooLoud = makeReportedSong('too-loud', ['too-loud']);

    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    expect(getRandomAdminReviewSong([tooLoud, both])?.key).toBe('both');
  });
});

describe('buildAdminReviewSongProcessingUrl', () => {
  it('opens unverified songs by their shared id and reported songs by their library id', () => {
    expect(buildAdminReviewSongProcessingUrl({ songId: 'song', sharedSongId: 'shared' }, true)).toBe(
      'edit/song/?externalSong=shared&admin=true&step=sync&processQueue=true',
    );
    expect(buildAdminReviewSongProcessingUrl({ songId: 'song' })).toBe('edit/song/?song=song&admin=true&step=sync');
  });
});

describe('toAdminReviewSongs', () => {
  it('lists unverified and reported songs, merging reasons when a song is both', () => {
    const songs = toAdminReviewSongs(
      [
        {
          sharedSongId: 'a',
          songId: 'a',
          artist: 'A',
          title: 'A',
          language: [],
          videoId: '',
          firstSeenAt: 1,
          updated: 1,
        },
      ],
      [
        {
          songId: 'a',
          artist: 'A',
          title: 'A',
          language: [],
          videoId: '',
          issues: ['too-loud'],
          reportCounts: { 'too-loud': 6 },
        },
        { songId: 'b', artist: 'B', title: 'B', language: [], videoId: '', issues: ['not-in-sync'], reportCounts: {} },
      ],
    );

    expect(songs.map(({ key, reasons, sharedSongId }) => ({ key, reasons, sharedSongId }))).toEqual([
      { key: 'a', reasons: ['unverified', 'too-loud'], sharedSongId: 'a' },
      { key: 'b', reasons: ['not-in-sync'], sharedSongId: undefined },
    ]);
  });
});

describe('getNextAdminReviewSongProcessingUrl', () => {
  it('builds a processing URL for the randomly selected next song', () => {
    const current = makeSong({ sharedSongId: 'current' });
    const other = makeSong({ sharedSongId: 'other' });

    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(getNextAdminReviewSongProcessingUrl([current, other], 'current')).toBe(
      buildAdminReviewSongProcessingUrl({ songId: 'other', sharedSongId: 'other' }, true),
    );

    vi.restoreAllMocks();
  });

  it('falls back to the admin list when no other song is left in the queue', () => {
    const current = makeSong({ sharedSongId: 'current' });

    expect(getNextAdminReviewSongProcessingUrl([current], 'current')).toBe('admin/');
  });
});
