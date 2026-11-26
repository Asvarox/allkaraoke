import { toSongHoverPreview } from '~/modules/online/client/song-preview';
import { mulitrack } from '~/modules/songs/utils/song-fixture';

describe('toSongHoverPreview', () => {
  it('moves the default preview moment to the same point of a slower instrumental', () => {
    const song = {
      ...mulitrack,
      gap: 0,
      bpm: 120,
      videoGap: 0,
      previewStart: undefined,
      instrumental: { video: 'instrumental', gap: 0, videoGap: 0, volume: undefined, bpm: 60 },
    };

    // A minute into the original is two minutes into the half-speed instrumental
    expect(toSongHoverPreview(song, undefined, true)).toMatchObject({ video: 'instrumental', previewStart: 120 });
    expect(toSongHoverPreview(song, undefined, false)).toMatchObject({ previewStart: 60 });
  });
});
