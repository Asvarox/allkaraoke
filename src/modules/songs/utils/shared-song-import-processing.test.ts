import { describe, expect, it } from 'vitest';

import { Song } from '~/interfaces';

import {
  applyCommonSharedSongImportProcessing,
  applyEscEditionFromTitle,
  FALLBACK_VIDEO_DURATION_SECONDS,
  getLyricsEndTimeMs,
  lyricsFitWithinVideoDuration,
} from './shared-song-import-processing';

const createSong = (): Song => ({
  id: 'test-song',
  shortId: 1,
  artist: 'Artist',
  artistOrigin: undefined,
  title: 'Test Title',
  video: 'abc1234',
  language: ['English'],
  year: undefined,
  gap: 1000,
  bpm: 120,
  bar: 4,
  sourceUrl: undefined,
  author: undefined,
  authorUrl: undefined,
  edition: undefined,
  genre: undefined,
  lastUpdate: undefined,
  videoGap: undefined,
  previewStart: undefined,
  previewEnd: undefined,
  volume: undefined,
  manualVolume: undefined,
  realBpm: undefined,
  unsupportedProps: [],
  mergedTrack: {
    changes: [],
    sections: [],
  },
  tracks: [
    {
      changes: [],
      sections: [
        {
          type: 'notes',
          start: 0,
          notes: [
            {
              type: 'normal',
              start: 8,
              length: 4,
              pitch: 10,
              lyrics: 'la',
            },
          ],
        },
      ],
    },
  ],
});

describe('unverifiedSongProcessing', () => {
  it('extracts ESC edition from title suffix', () => {
    const song = createSong();
    song.title = 'My Song (ESC 2026 Bulgaria)';

    applyEscEditionFromTitle(song);

    expect(song.title).toBe('My Song');
    expect(song.edition).toBe('ESC 2026');
  });

  it('leaves title unchanged when ESC suffix is missing', () => {
    const song = createSong();

    applyEscEditionFromTitle(song);

    expect(song.title).toBe('Test Title');
    expect(song.edition).toBeUndefined();
  });

  it('calculates lyrics end time in milliseconds', () => {
    const song = createSong();

    // Beat length is 125ms at BPM 120 and bar 4: (60 / 120 / 4) * 1000
    // Last note end beat is 12, so 12 * 125 + 1000 gap = 2500ms.
    expect(getLyricsEndTimeMs(song)).toBe(2500);
  });

  it('validates lyrics against video duration', () => {
    const song = createSong();

    expect(lyricsFitWithinVideoDuration(song, 3)).toBe(true);
    expect(lyricsFitWithinVideoDuration(song, 2)).toBe(false);
  });

  it('uses 20 minutes as fallback duration cap', () => {
    expect(FALLBACK_VIDEO_DURATION_SECONDS).toBe(1200);
  });

  it('applies common shared song import processing including ID regeneration', () => {
    const song = createSong();
    song.id = 'song-kpop-demon-hunters-saja-boys-your-idol-movie-version';
    song.artist = 'Demon Hunters';
    song.title = 'Saja Boys - Your Idol (movie version)';

    applyCommonSharedSongImportProcessing(song);

    expect(song.title).toBe('Saja Boys - Your Idol');
    expect(song.id).toBe('demon-hunters-saja-boys-your-idol');
  });
});
