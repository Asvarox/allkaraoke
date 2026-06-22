import { describe, expect, it, vi } from 'vitest';
import { SongPreview } from '~/interfaces';
import { importSongsFromPostHogBase } from './import-songs-from-post-hog-base';

const makeUnverifiedSongTxt = ({ artist, title, videoId }: { artist: string; title: string; videoId: string }) => `
#ARTIST:${artist}
#TITLE:${title}
#BPM:60
#LANGUAGE:English
#GAP:0
#VIDEO:https://www.youtube.com/watch?v=${videoId}
: 0 1 0 la
- 1
: 1 1 0 la
- 2
: 2 1 0 la
- 3
: 3 1 0 la
- 4
: 4 1 0 la
E
`;

describe('importSongsFromPostHogBase', () => {
  it('allows repeated submissions of the same song through', async () => {
    const addedSongs: Array<{ artist: string; title: string; video: string }> = [];
    const onSongAdded = vi.fn(async (song) => {
      addedSongs.push({
        artist: song.artist,
        title: song.title,
        video: song.video,
      });
    });
    const onSongRemoved = vi.fn(async () => {});

    await importSongsFromPostHogBase(
      async () => ({
        results: [
          [
            makeUnverifiedSongTxt({ artist: 'Artist One', title: 'Song One', videoId: 'video-1' }),
            'song-1',
            '2026-01-01T00:00:00.000Z',
          ],
          [
            makeUnverifiedSongTxt({ artist: 'Artist One', title: 'Song One', videoId: 'video-1' }),
            'song-1',
            '2026-01-01T00:01:00.000Z',
          ],
        ],
      }),
      [] as SongPreview[],
      [],
      onSongAdded,
      onSongRemoved,
    );

    expect(addedSongs).toHaveLength(2);
    expect(addedSongs[0]).toMatchObject({
      artist: 'Artist One',
      title: 'Song One',
      video: 'video-1',
    });
    expect(addedSongs[1]).toMatchObject({
      artist: 'Artist One',
      title: 'Song One',
      video: 'video-1',
    });
    expect(onSongRemoved).not.toHaveBeenCalled();
  });

  it('skips songs that collide with the built-in library', async () => {
    const onSongAdded = vi.fn(async () => {});
    const onSongRemoved = vi.fn(async () => {});

    await importSongsFromPostHogBase(
      async () => ({
        results: [
          [
            makeUnverifiedSongTxt({ artist: 'Built In Artist', title: 'Built In Song', videoId: 'video-1' }),
            'song-1',
            '2026-01-01T00:00:00.000Z',
          ],
        ],
      }),
      [{ id: 'built-in-song', video: 'video-1' } as SongPreview],
      [],
      onSongAdded,
      onSongRemoved,
    );

    expect(onSongAdded).not.toHaveBeenCalled();
    expect(onSongRemoved).not.toHaveBeenCalled();
  });

  it('skips malformed shared songs', async () => {
    const onSongAdded = vi.fn(async () => {});
    const onSongRemoved = vi.fn(async () => {});

    await importSongsFromPostHogBase(
      async () => ({
        results: [
          [
            `
#ARTIST:Victorious Cast
#TITLE:Shut Up n' Dance
#BPM:223
#LANGUAGE:English
#GAP:6353,031390134529
#VIDEO:https://www.youtube.com/watch?v=video-1
: 15 7 80 It's nine on the dot
R 15 9 24 And we just talk and we talk
: 15 10 93 And I just want it to stop
: NaN NaN NaN we here for the music?
- 40
: 40 1 0 la
- 50
: 50 1 0 la
- 60
: 60 1 0 la
- 70
: 70 1 0 la
E
`,
            'song-1',
            '2026-01-01T00:00:00.000Z',
          ],
        ],
      }),
      [] as SongPreview[],
      [],
      onSongAdded,
      onSongRemoved,
    );

    expect(onSongAdded).not.toHaveBeenCalled();
    expect(onSongRemoved).not.toHaveBeenCalled();
  });
});
