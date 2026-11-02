import { generateSection, generateSong } from '~/modules/utils/test-utils';

import getLyricsCoverage from './get-lyrics-coverage';

// generateSong uses a beat length of 1ms
describe('getLyricsCoverage', () => {
  it('returns the share of the video spanned by the lyrics', () => {
    const song = generateSong([[generateSection(1000, 0, 4000)]]);

    expect(getLyricsCoverage(song, 10)).toBeCloseTo(0.4);
  });

  it('excludes the video gap from the video length', () => {
    const song = generateSong([[generateSection(6000, 0, 2000)]], { videoGap: 6 });

    expect(getLyricsCoverage(song, 10)).toBeCloseTo(0.5);
  });

  it('spans all tracks', () => {
    const song = generateSong([[generateSection(0, 0, 2000)], [generateSection(5000, 0, 3000)]]);

    expect(getLyricsCoverage(song, 10)).toBeCloseTo(0.8);
  });

  it('ignores tracks without notes', () => {
    const song = generateSong([[generateSection(0, 0, 3000)], []]);

    expect(getLyricsCoverage(song, 10)).toBeCloseTo(0.3);
  });

  it('returns null when the video length is unknown', () => {
    const song = generateSong([[generateSection(0, 0, 3000)]]);

    expect(getLyricsCoverage(song, 0)).toBeNull();
  });
});
