import { readdirSync, readFileSync } from 'fs';
import { Note, Section, Song } from 'interfaces';
import { invert } from 'lodash-es';
import convertSongToTxt from 'Songs/utils/convertSongToTxt';
import convertTxtToSong, { typesMap } from 'Songs/utils/convertTxtToSong';
import isNotesSection from 'Songs/utils/isNotesSection';
import { generateNote } from 'utils/testUtils';

const invertedMapTypes = invert(typesMap);

const notesToText = (notes: Note[]) =>
    notes
        .map((note) => `${invertedMapTypes[note.type]} ${note.start} ${note.length} ${note.pitch} ${note.lyrics}`)
        .join('\n');

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
#GAP:${data?.gap ?? '0'}
${lines.join('\n')}
E`;
};

const videoUrl = 'https://www.youtube.com/watch?v=videoUrl';
const sourceUrl = 'sourceUrl';
const author = 'author';
const authorUrl = 'authorUrl';

const songStub = {
    sourceUrl,
    author,
    authorUrl,
    artist: 'ArtistTest',
    title: 'TitleTest',
    id: 'IdTest',
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

        const expectedSong: Song = { ...songStub, tracks: [{ sections }] };

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

            const expectedSong: Song = { ...songStub, tracks: [{ sections }] };
            const result = convertTxtToSong(inputSongTxt, videoUrl, author, authorUrl, sourceUrl);

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
});
