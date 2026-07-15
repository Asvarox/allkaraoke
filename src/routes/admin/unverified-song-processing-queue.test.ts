import {
  buildAdminUnverifiedSongProcessingUrl,
  getNextAdminUnverifiedSongProcessingUrl,
  getRandomAdminUnverifiedSong,
} from './unverified-song-processing-queue';
import { AdminUnverifiedSong } from './unverified-songs-admin-api';

const makeSong = (
  overrides: Partial<AdminUnverifiedSong> & Pick<AdminUnverifiedSong, 'sharedSongId'>,
): AdminUnverifiedSong => ({
  songId: overrides.sharedSongId,
  artist: 'Artist',
  title: 'Title',
  language: ['English'],
  videoId: 'video-id',
  firstSeenAt: 0,
  updated: 0,
  ...overrides,
});

describe('getRandomAdminUnverifiedSong', () => {
  it('returns undefined when there are no candidates', () => {
    expect(getRandomAdminUnverifiedSong([])).toBeUndefined();
  });

  it('excludes the current song from the candidates regardless of the random draw', () => {
    const current = makeSong({ sharedSongId: 'current' });
    const other = makeSong({ sharedSongId: 'other' });

    for (const randomValue of [0, 0.25, 0.5, 0.75, 0.999]) {
      vi.spyOn(Math, 'random').mockReturnValue(randomValue);
      expect(getRandomAdminUnverifiedSong([current, other], 'current')?.sharedSongId).toBe('other');
    }

    vi.restoreAllMocks();
  });

  it('weights the oldest submission 3x over the newest submission', () => {
    const oldest = makeSong({ sharedSongId: 'oldest', firstSeenAt: 0 });
    const newest = makeSong({ sharedSongId: 'newest', firstSeenAt: 100 });
    const songs = [oldest, newest];

    // totalWeight = 3 (oldest) + 1 (newest) = 4, so the oldest/newest split falls at random === 0.75.
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(getRandomAdminUnverifiedSong(songs)?.sharedSongId).toBe('oldest');

    vi.spyOn(Math, 'random').mockReturnValue(0.7499);
    expect(getRandomAdminUnverifiedSong(songs)?.sharedSongId).toBe('oldest');

    vi.spyOn(Math, 'random').mockReturnValue(0.75);
    expect(getRandomAdminUnverifiedSong(songs)?.sharedSongId).toBe('newest');

    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(getRandomAdminUnverifiedSong(songs)?.sharedSongId).toBe('newest');

    vi.restoreAllMocks();
  });

  it('weights submissions between the oldest and newest linearly by firstSeenAt', () => {
    const oldest = makeSong({ sharedSongId: 'oldest', firstSeenAt: 0 });
    const middle = makeSong({ sharedSongId: 'middle', firstSeenAt: 50 });
    const newest = makeSong({ sharedSongId: 'newest', firstSeenAt: 100 });
    const songs = [oldest, middle, newest];

    // weights = [3, 2, 1], totalWeight = 6 -> boundaries at random === 0.5 and random === 5/6.
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(getRandomAdminUnverifiedSong(songs)?.sharedSongId).toBe('oldest');

    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(getRandomAdminUnverifiedSong(songs)?.sharedSongId).toBe('middle');

    vi.spyOn(Math, 'random').mockReturnValue(5 / 6);
    expect(getRandomAdminUnverifiedSong(songs)?.sharedSongId).toBe('newest');

    vi.restoreAllMocks();
  });

  it('falls back to a uniform distribution when all submissions have the same firstSeenAt', () => {
    const first = makeSong({ sharedSongId: 'first', firstSeenAt: 42 });
    const second = makeSong({ sharedSongId: 'second', firstSeenAt: 42 });
    const songs = [first, second];

    vi.spyOn(Math, 'random').mockReturnValue(0.49);
    expect(getRandomAdminUnverifiedSong(songs)?.sharedSongId).toBe('first');

    vi.spyOn(Math, 'random').mockReturnValue(0.51);
    expect(getRandomAdminUnverifiedSong(songs)?.sharedSongId).toBe('second');

    vi.restoreAllMocks();
  });
});

describe('getNextAdminUnverifiedSongProcessingUrl', () => {
  it('builds a processing URL for the randomly selected next song', () => {
    const current = makeSong({ sharedSongId: 'current' });
    const other = makeSong({ sharedSongId: 'other' });

    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(getNextAdminUnverifiedSongProcessingUrl([current, other], 'current')).toBe(
      buildAdminUnverifiedSongProcessingUrl('other', true),
    );

    vi.restoreAllMocks();
  });

  it('falls back to the admin list when no other song is left in the queue', () => {
    const current = makeSong({ sharedSongId: 'current' });

    expect(getNextAdminUnverifiedSongProcessingUrl([current], 'current')).toBe('admin/');
  });
});
