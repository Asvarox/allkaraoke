import { readFileSync } from 'fs';
import { Song, SongTrack } from 'interfaces';
import convertTxtToSong from 'modules/Songs/utils/convertTxtToSong';
import isNotesSection from 'modules/Songs/utils/isNotesSection';
import mergeTracks from 'modules/Songs/utils/mergeTracks';
import { getLastNoteEnd } from 'modules/Songs/utils/notesSelectors';
import { generateSong } from 'modules/utils/testUtils';

const trackToLyrics = (track: SongTrack) =>
  track.sections
    .filter(isNotesSection)
    .map((s) => `[${s.start} - ${getLastNoteEnd(s)}] ${s.notes.map((n) => n.lyrics).join('')}`)
    .join('\n');

describe('mergeTracks', () => {
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
});
