import { PlayerNote } from '../../../../../interfaces';
import { generateNote, generatePlayerNote, generateSong } from '../../../../../testUtilts';
import calculateScore, { MAX_POINTS } from './calculateScore';

describe('calculateScore', () => {
    const note1 = generateNote(0, 5, { type: 'normal' });
    const note2 = generateNote(5, 5, { type: 'star' });
    const note3 = generateNote(10, 5, { type: 'normal' });
    const note4 = generateNote(15, 5, { type: 'star' });

    const song = generateSong([
        [
            { start: 0, type: 'notes', notes: [note1, note2] },
            { start: 0, type: 'notes', notes: [note3, note4] },
        ],
        [
            { start: 0, type: 'notes', notes: [note1] },
            { start: 0, type: 'notes', notes: [note4] },
        ],
    ]);

    it('should properly calculate score for player with no sung notes', () => {
        const playerNotes: PlayerNote[] = [];

        expect(calculateScore(playerNotes, song, 0)).toEqual(0);
    });

    it('should properly calculate score for player with all sung notes perfectly', () => {
        const playerNotes: PlayerNote[] = [
            generatePlayerNote(note1, 0, 0, note1.length, true, true),
            generatePlayerNote(note2, 0, 0, note2.length, true, true),
            generatePlayerNote(note3, 0, 0, note3.length, true, true),
            generatePlayerNote(note4, 0, 0, note4.length, true, true),
        ];

        expect(calculateScore(playerNotes, song, 0)).toEqual(MAX_POINTS);
    });

    it('should properly calculate score for player with not every sung notes being perfect', () => {
        const playerNotes: PlayerNote[] = [
            generatePlayerNote(note1, 0, 0, note1.length, true, true),
            generatePlayerNote(note2, 0, 0, note2.length, true, true),
            generatePlayerNote(note3, 0, 0, note3.length, false, false),
            generatePlayerNote(note4, 0, 0, note4.length, false, false),
        ];

        expect(Math.floor(calculateScore(playerNotes, song, 0))).toEqual(Math.floor(MAX_POINTS * 0.833333333));
    });

    it('should properly calculate score for player with only half notes sung', () => {
        const playerNotes: PlayerNote[] = [
            generatePlayerNote(note1, 0, 0, note1.length, true, true),
            generatePlayerNote(note4, 0, 0, note4.length, true, true),
        ];

        expect(calculateScore(playerNotes, song, 0)).toEqual(MAX_POINTS * 0.5);
    });

    it('should ignore notes with distance other than 0', () => {
        const playerNotes: PlayerNote[] = [
            generatePlayerNote(note1, -1, 0, note1.length, true),
            generatePlayerNote(note2, 1, 0, note2.length, true),
            generatePlayerNote(note3, -3, 0, note3.length, false),
            generatePlayerNote(note4, 3, 0, note4.length, false),
        ];

        expect(calculateScore(playerNotes, song, 0)).toEqual(0);
    });

    it('should properly calculate score for multiple tracks', () => {
        const player1Notes: PlayerNote[] = [
            generatePlayerNote(note1, 0, 0, note1.length, true, true),
            generatePlayerNote(note2, 0, 0, note2.length, true, true),
            generatePlayerNote(note3, 0, 0, note3.length, true, true),
            generatePlayerNote(note4, 0, 0, note4.length, true, true),
        ];
        const player2Notes: PlayerNote[] = [
            generatePlayerNote(note1, 0, 0, note1.length, true, true),
            generatePlayerNote(note4, 0, 0, note4.length, true, true),
        ];

        expect(calculateScore(player1Notes, song, 0)).toEqual(MAX_POINTS);
        expect(calculateScore(player2Notes, song, 1)).toEqual(MAX_POINTS);
    });

    describe('freestyle and rap', () => {
        const note5 = generateNote(20, 5, { type: 'freestyle' });
        const note6 = generateNote(25, 5, { type: 'rap' });

        const rapFreestyleSong = generateSong([
            [
                { start: 0, type: 'notes', notes: [note5] },
                { start: 0, type: 'notes', notes: [note6] },
            ],
        ]);

        it('should count rap and freestyle notes even if not in pitch', () => {
            const playerNotes: PlayerNote[] = [
                generatePlayerNote(note5, 5, 0, note5.length, true, true),
                generatePlayerNote(note6, -5, 0, note6.length, true, true),
            ];
            expect(calculateScore(playerNotes, rapFreestyleSong, 0)).toEqual(MAX_POINTS);
        });
    });
});
