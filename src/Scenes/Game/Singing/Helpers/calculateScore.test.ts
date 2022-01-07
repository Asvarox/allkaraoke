import { PlayerNote } from "../../../../interfaces";
import { generateNote, generatePlayerNote, generateSong } from "../../../../testUtilts";
import calculateScore, { MAX_POINTS } from "./calculateScore";

describe('calculateScore', () => {
    const note1 = generateNote(0, 5, { type: 'normal' });
    const note2 = generateNote(5, 5, { type: 'star' });
    const note3 = generateNote(10, 5, { type: 'normal' });
    const note4 = generateNote(15, 5, { type: 'star' });
    const song = generateSong([{ start: 0, type: 'notes', notes: [note1, note2, note3, note4] }]);

    it('should properly calculate score for player with no sung notes', () => {
        const playerNotes: PlayerNote[] = [];

        expect(calculateScore(playerNotes, song)).toEqual(0);
    });

    it('should properly calculate score for player with all sung notes perfectly', () => {
        const playerNotes: PlayerNote[] = [
            generatePlayerNote(note1, 0, 0, note1.length, true),
            generatePlayerNote(note2, 0, 0, note2.length, true),
            generatePlayerNote(note3, 0, 0, note3.length, true),
            generatePlayerNote(note4, 0, 0, note4.length, true),
        ];

        expect(calculateScore(playerNotes, song)).toEqual(MAX_POINTS);
    });

    it('should properly calculate score for player with all sung notes perfectly', () => {
        const playerNotes: PlayerNote[] = [
            generatePlayerNote(note1, 0, 0, note1.length, true),
            generatePlayerNote(note2, 0, 0, note2.length, true),
            generatePlayerNote(note3, 0, 0, note3.length, false),
            generatePlayerNote(note4, 0, 0, note4.length, false),
        ];

        expect(calculateScore(playerNotes, song)).toEqual(2187500);
    });
});