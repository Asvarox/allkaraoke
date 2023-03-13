import { Section, Song } from 'interfaces';
import isNotesSection from 'Songs/utils/isNotesSection';
import { getFirstNoteStartFromSections, getLastNoteEndFromSections } from 'Songs/utils/notesSelectors';
import { generateSection, generateSong } from 'utils/testUtils';
import generatePlayerChanges from './generatePlayerChanges';

const getSingableBeats = (sections: Section[], start: number, end: number) =>
    sections
        .filter(isNotesSection)
        .filter((section) => getFirstNoteStartFromSections([section]) >= start)
        .filter((section) => getLastNoteEndFromSections([section]) <= end)
        .reduce((current, section) => current + section.notes.reduce((length, note) => length + note.length, 0), 0);

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
        [require('../../../../../public/songs/Big Cyc-Swiat Wedlug Kiepskich.json')],
        [require('../../../../../public/songs/Cailin Russo & Chrissy Costanza-Phoenix.json')],
        [require('../../../../../public/songs/T.Love-King.json')],
        [require('../../../../../public/songs/Ed Sheeran-Galway Girl.json')],
        [require('../../../../../public/songs/Muse-Madness.json')],
        [require('../../../../../public/songs/Jeden Osiem L-Jak zapomniec.json')],
    ])('should handle real life examples better', (song: Song) => {
        expect(generatePlayerChanges(song)).toMatchSnapshot();
    });
});
