import { generateSection, generateSong } from '../../../../testUtilts';
import generatePlayerChanges from './generatePlayerChanges';

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
            [4 * 2, 4 * 4, 4 * 6, 4 * 8, 4 * 10, 4 * 12, 4 * 14, 4 * 16, 4 * 18],
        ]);
    });
});
