import { generateNote, generateSong } from '../../../testUtilts';
import normaliseSectionPaddings from './normaliseSectionPaddings';

describe('normaliseSectionPaddings', () => {
    it('should add max possible padding to the next section if theres no space to optimal one', () => {
        const song = generateSong(
            [
                [
                    { type: 'notes', start: 0, notes: [generateNote(0), generateNote(20, 15)] },
                    { type: 'notes', start: 40, notes: [generateNote(39), generateNote(50)] },
                ],
            ],
            { bar: 10 },
        );

        const expectedSong = generateSong(
            [
                [
                    { type: 'notes', start: 0, notes: [generateNote(0), generateNote(20, 15)] },
                    { type: 'notes', start: 35, notes: [generateNote(39), generateNote(50)] },
                ],
            ],
            { bar: 10 },
        );

        expect(normaliseSectionPaddings(song)).toEqual(expectedSong);
    });

    it('should add padding to the next section', () => {
        const song = generateSong(
            [
                [
                    { type: 'notes', start: 0, notes: [generateNote(0), generateNote(20, 10)] },
                    { type: 'notes', start: 30, notes: [generateNote(40), generateNote(50)] },
                ],
            ],
            { bar: 10 },
        );

        const expectedSong = generateSong(
            [
                [
                    { type: 'notes', start: 0, notes: [generateNote(0), generateNote(20, 10)] },
                    { type: 'notes', start: 30, notes: [generateNote(40), generateNote(50)] },
                ],
            ],
            { bar: 10 },
        );

        expect(normaliseSectionPaddings(song)).toEqual(expectedSong);
    });

    it('should add pause between sections if it the sapce between is larger than twice the desired padding', () => {
        const song = generateSong(
            [
                [
                    { type: 'notes', start: 0, notes: [generateNote(0), generateNote(20, 10)] },
                    { type: 'notes', start: 61, notes: [generateNote(60), generateNote(60)] },
                ],
            ],
            { bar: 10 },
        );

        const expectedSong = generateSong(
            [
                [
                    { type: 'notes', start: 0, notes: [generateNote(0), generateNote(20, 10)] },
                    { type: 'pause', start: 30, end: 50 },
                    { type: 'notes', start: 50, notes: [generateNote(60), generateNote(60)] },
                ],
            ],
            { bar: 10 },
        );

        expect(normaliseSectionPaddings(song)).toEqual(expectedSong);
    });

    it('should handle track with pause at the beginning gracefully', () => {
        const song = generateSong(
            [
                [
                    { type: 'pause', start: 0, end: 20 },
                    { type: 'notes', start: 40, notes: [generateNote(40), generateNote(50, 10)] },
                    { type: 'notes', start: 70, notes: [generateNote(70), generateNote(80)] },
                ],
            ],
            { bar: 10 },
        );

        const expectedSong = generateSong(
            [
                [
                    { type: 'pause', start: 0, end: 30 },
                    { type: 'notes', start: 30, notes: [generateNote(40), generateNote(50, 10)] },
                    { type: 'notes', start: 60, notes: [generateNote(70), generateNote(80)] },
                ],
            ],
            { bar: 10 },
        );

        expect(normaliseSectionPaddings(song)).toEqual(expectedSong);
    });
});
