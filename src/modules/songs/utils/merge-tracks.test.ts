import { readFileSync } from 'fs';

import { NotesSection, Song, SongTrack } from '~/interfaces';
import convertTxtToSong from '~/modules/songs/utils/convert-txt-to-song';
import isNotesSection from '~/modules/songs/utils/is-notes-section';
import mergeTracks from '~/modules/songs/utils/merge-tracks';
import { getLastNoteEnd } from '~/modules/songs/utils/notes-selectors';
import { generateNote, generateSong } from '~/modules/utils/test-utils';

const trackToLyrics = (track: SongTrack) =>
  track.sections
    .filter(isNotesSection)
    .map((s) => `[${s.start} - ${getLastNoteEnd(s)}] ${s.notes.map((n) => n.lyrics).join('')}`)
    .join('\n');

// Notes as [start, length, lyrics?]
const line = (breakStart: number, notes: [number, number, string?][]): NotesSection => ({
  type: 'notes',
  start: breakStart,
  notes: notes.map(([start, length, lyrics]) => generateNote(start, length, lyrics ? { lyrics } : {})),
});

const mergeLines = (first: NotesSection[], second: NotesSection[], data: Partial<Song> = {}) => {
  const song = generateSong([first, second], data);
  return trackToLyrics(mergeTracks(song.tracks, song));
};

describe('mergeTracks', () => {
  it('compares note times, not line breaks, when deciding whether lines collide', () => {
    const result = mergeLines(
      [
        line(0, [
          [0, 2, 'one '],
          [3, 4, 'two '],
        ]),
      ],
      // the line break is placed before the first track's last note ends, but the notes don't collide
      [
        line(5, [
          [8, 2, 'three '],
          [11, 30, 'four '],
        ]),
      ],
    );
    expect(result).toBe('[0 - 7] one two \n[7 - 41] three four ');
  });

  it("shortens a held note to let the other track's line in", () => {
    const result = mergeLines(
      [
        line(0, [
          [0, 2, 'one '],
          [3, 10, 'two '],
        ]),
      ],
      [
        line(9, [
          [10, 2, 'three '],
          [13, 2, 'four '],
        ]),
      ],
    );
    expect(result).toBe('[0 - 10] one two \n[10 - 15] three four ');
  });

  it('drops a last syllable that starts exactly when the other line does', () => {
    const result = mergeLines(
      [
        line(0, [
          [0, 2, 'one '],
          [3, 2, 'two '],
          [6, 2, 'three '],
        ]),
      ],
      [
        line(5, [
          [6, 2, 'four '],
          [9, 2, 'five '],
        ]),
      ],
    );
    expect(result).toBe('[0 - 5] one two \n[5 - 11] four five ');
  });

  it('keeps a long held last note rather than dropping it', () => {
    const lines = [
      [
        line(0, [
          [0, 2, 'one '],
          [3, 2, 'two '],
          [6, 2, 'three '],
        ]),
      ],
      [
        line(5, [
          [6, 2, 'four '],
          [9, 2, 'five '],
        ]),
      ],
    ];
    // bar: 1 makes a beat last a second, so the 2 beat "three" is too long to drop
    expect(mergeLines(lines[0], lines[1], { bar: 1 })).toBe('[0 - 8] one two three ');
  });

  it("drops the other track's line when the collision is more than a line's tail", () => {
    const result = mergeLines(
      [
        line(0, [
          [0, 2, 'one '],
          [3, 2, 'two '],
          [6, 2, 'three '],
        ]),
      ],
      [
        line(1, [
          [2, 2, 'four '],
          [5, 2, 'five '],
        ]),
      ],
    );
    expect(result).toBe('[0 - 8] one two three ');
  });

  it('does not squeeze in colliding backing vocals', () => {
    const result = mergeLines(
      [
        line(0, [
          [0, 2, 'one '],
          [3, 10, 'two '],
        ]),
      ],
      [
        line(9, [
          [10, 2, 'Oh! '],
          [13, 2, 'Oh! '],
        ]),
      ],
    );
    expect(result).toBe('[0 - 13] one two ');
  });

  it("keeps the lead when the other track's backing line only overlaps its held note", () => {
    const result = mergeLines(
      [
        line(0, [
          [0, 2, 'Ma'],
          [3, 20, 'ma '],
        ]),
        line(24, [
          [24, 2, 'Ooh'],
          [27, 2, '~'],
          [30, 30, '~ '],
        ]),
      ],
      [
        line(0, [
          [0, 20, 'Ooh '],
          [24, 4, 'ooh '],
        ]),
        line(29, [
          [30, 2, 'Any '],
          [33, 2, 'way '],
          [36, 2, 'the '],
          [39, 2, 'wind '],
          [42, 2, 'blows '],
        ]),
      ],
    );
    expect(result).toBe('[0 - 23] Mama \n[24 - 29] Ooh~\n[29 - 44] Any way the wind blows ');
  });

  it('lets the other track lead where the first one only has backing vocals', () => {
    const result = mergeLines(
      [
        line(0, [
          [0, 2, 'O! '],
          [3, 2, 'O! '],
        ]),
        line(10, [
          [10, 2, 'O! '],
          [13, 2, 'O! '],
        ]),
      ],
      [
        line(0, [
          [1, 2, 'one '],
          [4, 7, 'two '],
        ]),
      ],
    );
    expect(result).toBe('[0 - 11] one two ');
  });

  it('takes all lines of the richer track when a long note collides with several of its lines', () => {
    const result = mergeLines(
      [
        line(0, [
          [0, 2, 'in '],
          [3, 2, 'the '],
          [6, 40, 'end '],
        ]),
      ],
      [
        line(0, [
          [0, 2, 'in '],
          [3, 2, 'the '],
          [6, 2, 'end '],
        ]),
        line(8, [
          [10, 2, 'you '],
          [13, 2, 'kept '],
          [16, 2, 'everything '],
        ]),
        line(18, [
          [20, 2, 'inside, '],
          [23, 2, 'and '],
          [26, 2, 'even '],
        ]),
        line(28, [
          [30, 2, 'though '],
          [33, 2, 'I '],
          [36, 2, 'tried '],
        ]),
      ],
    );
    expect(result).toBe(
      '[0 - 8] in the end \n[8 - 18] you kept everything \n[18 - 28] inside, and even \n[28 - 38] though I tried ',
    );
  });

  it('should merge tracks', () => {
    const song: Song = generateSong([
      [
        { start: 0, type: 'notes', notes: [{ start: 0, length: 1, lyrics: 'a', pitch: 0, type: 'normal' }] },
        { start: 0, type: 'notes', notes: [{ start: 2, length: 3, lyrics: 'a', pitch: 0, type: 'normal' }] },
      ],
      [
        { start: 0, type: 'notes', notes: [{ start: 0, length: 1, lyrics: 'a', pitch: 0, type: 'normal' }] },
        { start: 6, type: 'notes', notes: [{ start: 6, length: 3, lyrics: 'a', pitch: 0, type: 'normal' }] },
      ],
    ]);
    const expected: SongTrack = {
      sections: [
        { start: 0, type: 'notes', notes: [{ start: 0, length: 1, lyrics: 'a', pitch: 0, type: 'normal' }] },
        { start: 0, type: 'notes', notes: [{ start: 2, length: 3, lyrics: 'a', pitch: 0, type: 'normal' }] },
        { start: 6, type: 'notes', notes: [{ start: 6, length: 3, lyrics: 'a', pitch: 0, type: 'normal' }] },
      ],
      changes: expect.anything(),
    };
    const result = mergeTracks(song.tracks, song);
    expect(result).toEqual(expected);
  });

  it('should properly merge tracks in beelzeboss', () => {
    const txt = readFileSync(`./public/songs/tenacious-d-beelzeboss-the-final-showdown.txt`, {
      encoding: 'utf-8',
    }).replace(/\r\n/g, '\n');

    const song = convertTxtToSong(txt);

    const result = mergeTracks(song.tracks, song);
    expect(trackToLyrics(result)).toMatchSnapshot();
  });

  it('should properly merge tracks in dosko', () => {
    const txt = readFileSync(`./public/songs/stachursky-dosko.txt`, {
      encoding: 'utf-8',
    }).replace(/\r\n/g, '\n');

    const song = convertTxtToSong(txt);

    const result = mergeTracks(song.tracks, song);
    expect(trackToLyrics(result)).toMatchSnapshot();
  });

  it('should properly merge tracks in queens bohemian rhapsody', () => {
    const txt = readFileSync(`./public/songs/queen-bohemian-rhapsody.txt`, {
      encoding: 'utf-8',
    }).replace(/\r\n/g, '\n');

    const song = convertTxtToSong(txt);

    const result = mergeTracks(song.tracks, song);
    expect(trackToLyrics(result)).toMatchSnapshot();
  });

  it('should properly merge tracks in heavy is the crown', () => {
    const txt = readFileSync(`./public/songs/linkin-park-heavy-is-the-crown.txt`, {
      encoding: 'utf-8',
    }).replace(/\r\n/g, '\n');

    const song = convertTxtToSong(txt);

    const result = mergeTracks(song.tracks, song);
    expect(trackToLyrics(result)).toMatchSnapshot();
  });

  it('should properly merge tracks in in the end', () => {
    const txt = readFileSync(`./public/songs/linkin-park-in-the-end.txt`, {
      encoding: 'utf-8',
    }).replace(/\r\n/g, '\n');

    const song = convertTxtToSong(txt);

    const result = mergeTracks(song.tracks, song);
    expect(trackToLyrics(result)).toMatchSnapshot();
  });
});
