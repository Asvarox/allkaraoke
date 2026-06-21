import { UnverifiedSongRecord } from './unverified-songs-store';

export const generateUnverifiedSongRecord = (overrides: Partial<UnverifiedSongRecord> = {}): UnverifiedSongRecord => ({
  sharedSongId: 'song-1',
  songId: 'song-1',
  songTxt: '#TITLE:Song\nE',
  artist: 'Artist',
  title: 'Title',
  language: ['English'],
  videoId: 'koBUXESJZ8g',
  validatedAt: 1,
  firstSeenAt: overrides.firstSeenAt ?? 1,
  updated: overrides.updated ?? 1,
  lastSeenAt: 1,
  sourceUserId: 'user-1',
  sourceEventAt: 1,
  ...overrides,
});
