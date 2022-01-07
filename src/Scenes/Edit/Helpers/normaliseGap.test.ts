import { generateNote, generateSong } from "../../../testUtilts";
import normaliseGap from "./normaliseGap";

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
    });

    it.only('should normalise when note starts at a negative number', () => {
        const song = generateSong([
            { type: 'notes', start: 0, notes: [generateNote(-20), generateNote(40)]},
            { type: 'notes', start: 60, notes: [generateNote(80), generateNote(100)]},
        ], { gap: 20 });

        const expectedSong = generateSong([
            { type: 'notes', start: 0, notes: [generateNote(0), generateNote(60)]},
            { type: 'notes', start: 80, notes: [generateNote(100), generateNote(120)]},
        ], { gap: 0 });

        expect(normaliseGap(song)).toEqual(expectedSong);
    });
});