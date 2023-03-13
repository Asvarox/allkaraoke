import normaliseGap from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/normaliseGap';
import { generateNote, generateSong } from 'utils/testUtils';

describe('normaliseGap', () => {
    it('should normalise when first section and note doesnt start at 0', () => {
        const song = generateSong(
            [
                [
                    { type: 'notes', start: 10, notes: [generateNote(20), generateNote(40)] },
                    { type: 'notes', start: 60, notes: [generateNote(80), generateNote(100)] },
                ],
            ],
            { gap: 20 },
        );

        const expectedSong = generateSong(
            [
                [
                    { type: 'notes', start: 0, notes: [generateNote(0), generateNote(20)] },
                    { type: 'notes', start: 40, notes: [generateNote(60), generateNote(80)] },
                ],
            ],
            { gap: 40 },
        );

        expect(normaliseGap(song)).toEqual(expectedSong);
    });

    it('should normalise when note starts at a negative number', () => {
        const song = generateSong(
            [
                [
                    { type: 'notes', start: 0, notes: [generateNote(-20), generateNote(40)] },
                    { type: 'notes', start: 60, notes: [generateNote(80), generateNote(100)] },
                ],
            ],
            { gap: 20 },
        );

        const expectedSong = generateSong(
            [
                [
                    { type: 'notes', start: 0, notes: [generateNote(0), generateNote(60)] },
                    { type: 'notes', start: 80, notes: [generateNote(100), generateNote(120)] },
                ],
            ],
            { gap: 0 },
        );

        expect(normaliseGap(song)).toEqual(expectedSong);
    });

    it('should normalise based on second track if its starting before the first', () => {
        const song = generateSong(
            [
                [{ type: 'notes', start: 0, notes: [generateNote(20), generateNote(40)] }],
                [{ type: 'notes', start: 0, notes: [generateNote(10), generateNote(30)] }],
            ],
            { gap: 20 },
        );

        const expectedSong = generateSong(
            [
                [{ type: 'notes', start: 0, notes: [generateNote(10), generateNote(30)] }],
                [{ type: 'notes', start: 0, notes: [generateNote(0), generateNote(20)] }],
            ],
            { gap: 30 },
        );

        expect(normaliseGap(song)).toEqual(expectedSong);
    });

    it('should normalise based on first track if its starting before the second', () => {
        const song = generateSong(
            [
                [{ type: 'notes', start: 0, notes: [generateNote(10), generateNote(30)] }],
                [{ type: 'notes', start: 0, notes: [generateNote(20), generateNote(40)] }],
            ],
            { gap: 20 },
        );

        const expectedSong = generateSong(
            [
                [{ type: 'notes', start: 0, notes: [generateNote(0), generateNote(20)] }],
                [{ type: 'notes', start: 0, notes: [generateNote(10), generateNote(30)] }],
            ],
            { gap: 30 },
        );

        expect(normaliseGap(song)).toEqual(expectedSong);
    });

    it('should ignore pause-sections at the beginning of the track', () => {
        const song = generateSong(
            [
                [
                    { type: 'pause', start: 0, end: 10 },
                    { type: 'notes', start: 10, notes: [generateNote(20), generateNote(40)] },
                ],
            ],
            { gap: 20 },
        );

        const expectedSong = generateSong([[{ type: 'notes', start: 0, notes: [generateNote(0), generateNote(20)] }]], {
            gap: 40,
        });

        expect(normaliseGap(song)).toEqual(expectedSong);
    });
});
