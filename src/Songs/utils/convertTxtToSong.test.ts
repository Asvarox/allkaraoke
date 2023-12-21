import { readdirSync, readFileSync } from 'fs';
import { Note, Section, Song } from 'interfaces';
import convertSongToTxt from 'Songs/utils/convertSongToTxt';
import convertTxtToSong, { txtTypesMap } from 'Songs/utils/convertTxtToSong';
import isNotesSection from 'Songs/utils/isNotesSection';
import { generateNote } from 'utils/testUtils';

const notesToText = (notes: Note[]) =>
  notes.map((note) => `${txtTypesMap[note.type]} ${note.start} ${note.length} ${note.pitch} ${note.lyrics}`).join('\n');

const generateSongTxt = (trackSections: Section[][], data: Partial<Song> = {}) => {
  const lines: string[] = [];
  trackSections.forEach(([first, ...sections]) => {
    if (!isNotesSection(first)) throw Error(`first section must contain notes, got ${JSON.stringify(first)}`);

    lines.push(notesToText(first.notes));
    sections.forEach((section) =>
      lines.push(
        isNotesSection(section)
          ? `- ${section.start}\n${notesToText(section.notes)}`
          : `- ${section.start} ${section.end}`,
      ),
    );
  });

  return `
#ID:${data?.id ?? 'IdTest'}
#ARTIST:${data?.artist ?? 'ArtistTest'}
#TITLE:${data?.title ?? 'TitleTest'}
#BPM:${data?.bpm ?? '60'}
#LANGUAGE:${data?.language ?? 'language'}
#GAP:${data?.gap ?? '0'}
${lines.join('\n')}
E`;
};

const videoUrl = 'https://www.youtube.com/watch?v=videoUrl';
const videoId = '12345678901';
const sourceUrl = 'sourceUrl';
const author = 'author';
const authorUrl = 'authorUrl';
const usdb_animux_de = `
#ARTIST:Tears For Fears
#TITLE:Woman In Chains
#MP3:Tears For Fears - Woman In Chains.mp3
#CREATOR:Zevac
#COVER:Tears For Fears - Woman In Chains [CO].jpg
#BACKGROUND:Tears For Fears - Woman In Chains [BG].jpg
#YEAR:1989
#LANGUAGE:English
#BPM:320
#GAP:61100
#VIDEO:v=QzkK3ZtI9SU,co=woman-in-chains-527f82543d19d.jpg,bg=tears-for-fears-629b760b75972.jpg
#END:380000
: 0 2 0 You 
: 4 3 5 bet
: 8 3 7 ter 
E
`;

const usdb_animux_de_notes = [
  { length: 2, lyrics: 'You ', pitch: 0, start: 0, type: 'normal' },
  { length: 3, lyrics: 'bet', pitch: 5, start: 4, type: 'normal' },
  { length: 3, lyrics: 'ter ', pitch: 7, start: 8, type: 'normal' },
];
const usdb_animux_de_song = {
  author: 'Zevac',
  artist: 'Tears For Fears',
  title: 'Woman In Chains',
  id: 'tears-for-fears-woman-in-chains',
  language: 'English',
  bpm: 320,
  bar: 4,
  gap: 61100,
  video: 'QzkK3ZtI9SU',
  year: '1989',
  tracks: [{ sections: [{ notes: usdb_animux_de_notes, start: 0, type: 'notes' }] }],
} as any;

const songStub = {
  sourceUrl,
  author,
  authorUrl,
  artist: 'ArtistTest',
  title: 'TitleTest',
  id: 'IdTest',
  language: 'language',
  bpm: 60,
  bar: 4,
  gap: 0,
  video: expect.anything(),
} as any;

describe('convertTxtToSong', () => {
  it('should convert single track', () => {
    const sections: Section[] = [
      { start: 0, type: 'notes', notes: [generateNote(0), generateNote(1)] },
      { start: 5, type: 'notes', notes: [generateNote(7), generateNote(10)] },
    ];

    const inputSongTxt = generateSongTxt([sections]);

    const expectedSong: Song = { ...songStub, tracks: [{ sections }], video: 'videoUrl' };

    expect(convertTxtToSong(inputSongTxt, videoUrl, author, authorUrl, sourceUrl)).toEqual(expectedSong);
  });

  describe('multitrack', function () {
    it('should convert double track', () => {
      const sections: Section[] = [
        { start: 0, type: 'notes', notes: [generateNote(0), generateNote(1)] },
        { start: 15, type: 'notes', notes: [generateNote(17), generateNote(20)] },
      ];

      const inputSongTxt = generateSongTxt([sections, sections]);

      const expectedSong: Song = { ...songStub, tracks: [{ sections }, { sections }] };

      expect(convertTxtToSong(inputSongTxt, videoUrl, author, authorUrl, sourceUrl)).toEqual(expectedSong);
    });

    it('should avoid splitting tracks if notes overlap with heuristics', () => {
      const sections: Section[] = [
        { start: 0, type: 'notes', notes: [generateNote(0), generateNote(1)] },
        { start: 5, type: 'notes', notes: [generateNote(7), generateNote(10)] },
        { start: 8, type: 'notes', notes: [generateNote(10), generateNote(13)] },
      ];

      const inputSongTxt = generateSongTxt([sections]);

      const expectedSong: Song = { ...songStub, tracks: [{ sections }], video: videoId };
      const result = convertTxtToSong(inputSongTxt, videoId, author, authorUrl, sourceUrl);

      expect(result.tracks).toHaveLength(1);
      expect(result).toEqual(expectedSong);
    });
  });

  describe('validate against real files', () => {
    const SONGS_FOLDER = './public/songs';

    it('should properly convert back and forth all the songs', () => {
      const songs = readdirSync(SONGS_FOLDER);

      for (const file of songs) {
        if (!file.endsWith('.txt')) continue;

        // uncomment to get the failing file
        // console.log(file);
        const txt = readFileSync(`${SONGS_FOLDER}/${file}`, { encoding: 'utf-8' });

        const song = convertTxtToSong(txt);

        expect(convertSongToTxt(song)).toEqual(txt);
      }
    });

    it.skip('Useful to debug specific failing song file', () => {
      const file = 'name';
      const song: Song = JSON.parse(readFileSync(`${SONGS_FOLDER}/${file}`, { encoding: 'utf-8' }));

      expect(convertTxtToSong(convertSongToTxt(song))).toEqual(song);
    });
  });

  it('should convert usdb.animux.de format', () => {
    const parsed = convertTxtToSong(usdb_animux_de);
    const clean = Object.fromEntries(Object.entries(parsed).filter(([, value]) => value !== undefined));

    expect(clean).toEqual(usdb_animux_de_song);
  });
});
