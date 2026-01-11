import { readFileSync } from 'fs';
import convertTxtToSong from '~/modules/Songs/utils/convertTxtToSong';
import generatePlayerChanges from '~/modules/Songs/utils/generatePlayerChanges';
import { generateSection, generateSong } from '~/modules/utils/testUtils';

describe('generatePlayerChanges', () => {
  it('should generate 10 parts', () => {
    const song = generateSong(
      [
        [
          generateSection(4 * 0, 1, 1),
          generateSection(4 * 1, 1, 1),
          generateSection(4 * 2, 1, 1),
          generateSection(4 * 3, 1, 1),
          generateSection(4 * 4, 1, 1),
          generateSection(4 * 5, 1, 1),
          generateSection(4 * 6, 1, 1),
          generateSection(4 * 7, 1, 1),
          generateSection(4 * 8, 1, 1),
          generateSection(4 * 9, 1, 1),
          generateSection(4 * 10, 1, 1),
          generateSection(4 * 11, 1, 1),
          generateSection(4 * 12, 1, 1),
          generateSection(4 * 13, 1, 1),
          generateSection(4 * 14, 1, 1),
          generateSection(4 * 15, 1, 1),
          generateSection(4 * 16, 1, 1),
          generateSection(4 * 17, 1, 1),
          generateSection(4 * 18, 1, 1),
          generateSection(4 * 19, 1, 1),
        ],
      ],
      { bpm: 0.1 },
    );

    expect(generatePlayerChanges(song)).toEqual([
      [4 + 1, 4 * 3 + 1, 4 * 5 + 1, 4 * 7 + 1, 4 * 9 + 1, 4 * 11 + 1, 4 * 13 + 1, 4 * 15 + 1, 4 * 17 + 1],
    ]);
  });

  it.each([
    ['./public/songs/big-cyc-facet-to-swinia.txt'],
    ['./public/songs/cailin-russo-chrissy-costanza-phoenix.txt'],
    ['./public/songs/tlove-king.txt'],
    ['./public/songs/ed-sheeran-galway-girl.txt'],
    ['./public/songs/muse-madness.txt'],
    ['./public/songs/jeden-osiem-l-jak-zapomniec.txt'],
  ])('should handle real life examples better', (song: string) => {
    const songTxt = readFileSync(song, { encoding: 'utf-8' });
    expect(generatePlayerChanges(convertTxtToSong(songTxt))).toMatchSnapshot();
  });
});
