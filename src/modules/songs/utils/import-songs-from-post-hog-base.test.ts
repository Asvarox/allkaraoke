import { describe, expect, it, vi } from 'vitest';
import { SongPreview } from '~/interfaces';
import { importSongsFromPostHogBase } from './import-songs-from-post-hog-base';

const makeSharedSongTxt = ({ artist, title, videoId }: { artist: string; title: string; videoId: string }) => `
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
            makeSharedSongTxt({ artist: 'Artist One', title: 'Song One', videoId: 'video-1' }),
            'song-1',
            '2026-01-01T00:00:00.000Z',
          ],
          [
            makeSharedSongTxt({ artist: 'Artist One', title: 'Song One', videoId: 'video-1' }),
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
            makeSharedSongTxt({ artist: 'Built In Artist', title: 'Built In Song', videoId: 'video-1' }),
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
});
