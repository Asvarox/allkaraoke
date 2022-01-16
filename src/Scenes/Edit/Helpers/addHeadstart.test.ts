import { generateNote, generateSong } from '../../../testUtilts';
import addHeadstart from './addHeadstart';

describe('addHeadstart', () => {
    it('should add desired headstart if theres enough gap of it', () => {
        const song = generateSong(
            [
                [
                    { type: 'notes', start: 0, notes: [generateNote(0), generateNote(20)] },
                    { type: 'notes', start: 60, notes: [generateNote(80), generateNote(100)] },
                ],
            ],
            { gap: 2000, bar: 10 },
        );

        const expectedSong = generateSong(
            [
                [
                    { type: 'notes', start: 0, notes: [generateNote(10), generateNote(30)] },
                    { type: 'notes', start: 70, notes: [generateNote(90), generateNote(110)] },
                ],
            ],
            { gap: 1000, bar: 10 },
        );

        expect(addHeadstart(song)).toEqual(expectedSong);
    });
    it('should add as much headstart as possible if there is not enough gap to cover desired headstart', () => {
        const song = generateSong(
            [
                [
                    { type: 'notes', start: 0, notes: [generateNote(0), generateNote(20)] },
                    { type: 'notes', start: 60, notes: [generateNote(80), generateNote(100)] },
                ],
            ],
            { gap: 500, bar: 10 },
        );

        const expectedSong = generateSong(
            [
                [
                    { type: 'notes', start: 0, notes: [generateNote(5), generateNote(25)] },
                    { type: 'notes', start: 65, notes: [generateNote(85), generateNote(105)] },
                ],
            ],
            { gap: 0, bar: 10 },
        );

        expect(addHeadstart(song)).toEqual(expectedSong);
    });
});
