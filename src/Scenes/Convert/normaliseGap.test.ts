import { Note, Section, Song } from "../../interfaces";
import normaliseGap from "./normaliseGap";

const generateNote = (start: number, length = 1): Note => ({ start, length, type: 'normal', lyrics: 'test', pitch: 5 });

const generateSong = (sections: Section[], data: Partial<Song> = {}): Song => ({
    ...({} as any),
    ...data,
    bpm: 60, // makes it easy to calc - beatLength = 1ms
    bar: 1000, // makes it easy to calc - beatLength = 1ms
    tracks: [{ sections }]
});

describe('normaliseGap', () => {
    it('should normalise when first section and note doesnt start at 0', () => {
        const song = generateSong([
            { type: 'notes', start: 10, notes: [generateNote(20), generateNote(40)]},
            { type: 'notes', start: 60, notes: [generateNote(80), generateNote(100)]},
        ], { gap: 20 });

        const expectedSong = generateSong([
            { type: 'notes', start: 0, notes: [generateNote(0), generateNote(20)]},
            { type: 'notes', start: 40, notes: [generateNote(60), generateNote(80)]},
        ], { gap: 40 });

        expect(normaliseGap(song)).toEqual(expectedSong);
    })
})