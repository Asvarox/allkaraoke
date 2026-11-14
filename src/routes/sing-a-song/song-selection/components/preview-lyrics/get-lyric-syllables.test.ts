import { NotesSection } from '~/interfaces';
import { generateNote, generateSong } from '~/modules/utils/test-utils';

import { findCurrentIndex, getLyricSyllables, getLyricWords } from './get-lyric-syllables';

const section = (notes: [number, number, string][]): NotesSection => ({
  type: 'notes',
  start: notes[0][0],
  notes: notes.map(([start, length, lyrics]) => generateNote(start, length, { lyrics })),
});

describe('getLyricSyllables', () => {
  it('folds pitch-change notes into the syllable before them', () => {
    const song = generateSong(
      [
        [
          section([
            [0, 10, 'Hel'],
            [10, 10, 'lo'],
            [20, 10, '~'],
            [30, 10, '- '],
            [40, 10, 'wor'],
            [50, 10, '~ld'],
          ]),
        ],
      ],
      { gap: 100 },
    );

    const syllables = getLyricSyllables(song);

    expect(syllables.map((s) => s.text)).toEqual(['Hel', 'lo ', 'wor', 'ld']);
    expect(syllables[1]).toMatchObject({ startMs: 110, endMs: 140 });
    expect(syllables.map((s) => s.index)).toEqual([0, 1, 2, 3]);
  });

  it('marks the first syllable of each line', () => {
    const song = generateSong([
      [
        section([
          [0, 1, 'One '],
          [1, 1, 'two'],
        ]),
        section([[5, 1, 'Three']]),
      ],
    ]);

    expect(getLyricSyllables(song).map((s) => s.lineStart)).toEqual([true, false, true]);
  });

  it('finds the syllable being sung', () => {
    const syllables = getLyricSyllables(
      generateSong([
        [
          section([
            [0, 1, 'a'],
            [10, 1, 'b'],
            [20, 1, 'c'],
          ]),
        ],
      ]),
    );

    expect(findCurrentIndex(syllables, -5)).toBe(-1);
    expect(findCurrentIndex(syllables, 10)).toBe(1);
    expect(findCurrentIndex(syllables, 15)).toBe(1);
    expect(findCurrentIndex(syllables, 500)).toBe(2);
  });

  it('joins syllables into words', () => {
    const syllables = getLyricSyllables(
      generateSong([
        [
          section([
            [0, 1, 'Hel'],
            [1, 1, 'lo '],
            [2, 1, 'big '],
            [3, 1, 'wor'],
          ]),
          section([
            [10, 1, 'ld'],
            [11, 1, '~'],
          ]),
        ],
      ]),
    );

    const words = getLyricWords(syllables);

    expect(words.map((word) => word.syllables.map((s) => s.text))).toEqual([['Hel', 'lo'], ['big'], ['wor'], ['ld']]);
    expect(words[0]).toMatchObject({ startMs: 0, endMs: 2, lineStart: true });
    expect(words[3]).toMatchObject({ startMs: 10, endMs: 12, lineStart: true });
  });

  it('tells lines that follow a pause from ones that follow straight on', () => {
    const syllables = getLyricSyllables(
      generateSong([
        [
          section([[0, 1, 'One ']]),
          section([[2, 1, 'two ']]),
          { type: 'pause', start: 3, end: 10 },
          section([[10, 1, 'three']]),
        ],
      ]),
    );

    expect(syllables.map((s) => [s.text.trim(), s.section, s.afterPause])).toEqual([
      ['One', 0, false],
      ['two', 1, false],
      ['three', 3, true],
    ]);
  });
});
