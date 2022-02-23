import { FrequencyRecord, Note, PlayerNote } from '../../../../../interfaces';
import { generateNote } from '../../../../../testUtilts';
import { appendFrequencyToPlayerNotes } from './appendFrequencyToPlayerNotes';

describe('appendFrequencyToPlayerNotes', () => {
    it('should create a new note if the playerNote array is empty', () => {
        const playerNotes: PlayerNote[] = [];
        const record: FrequencyRecord = { timestamp: 0, frequency: 440 };
        const note: Note = generateNote(0, 3, { pitch: 69 });

        appendFrequencyToPlayerNotes(playerNotes, record, note, 1);

        expect(playerNotes).toContainEqual(expect.objectContaining({ length: 0, distance: 0 }));
    });

    it('should append records of same frequency into single player note', () => {
        const playerNotes: PlayerNote[] = [];
        const note: Note = generateNote(0, 3, { pitch: 69 });

        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 0, frequency: 440 }, note, 1);
        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 1, frequency: 440 }, note, 1);
        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 2, frequency: 440 }, note, 1);

        expect(playerNotes).toContainEqual(expect.objectContaining({ length: 2, distance: 0 }));
    });

    it('should append records of different frequency into multiple player notes', () => {
        const playerNotes: PlayerNote[] = [];
        const note: Note = generateNote(0, 5, { pitch: 69 });

        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 0, frequency: 440 }, note, 1);
        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 1, frequency: 440 }, note, 1);
        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 2, frequency: 380 }, note, 1);
        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 3, frequency: 380 }, note, 1);
        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 4, frequency: 440 }, note, 1);
        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 5, frequency: 440 }, note, 1);

        expect(playerNotes).toContainEqual(expect.objectContaining({ length: 1, distance: 0 }));
        expect(playerNotes).toContainEqual(expect.objectContaining({ length: 1, distance: -3 }));
        expect(playerNotes).toContainEqual(expect.objectContaining({ length: 1, distance: 0 }));
    });

    it('should append records of same frequency for different notes into multiple player notes', () => {
        const playerNotes: PlayerNote[] = [];
        const note1: Note = generateNote(0, 2, { pitch: 69 });
        const note2: Note = generateNote(3, 5, { pitch: 69 });

        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 0, frequency: 440 }, note1, 1);
        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 1, frequency: 440 }, note1, 1);
        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 4, frequency: 440 }, note2, 1);
        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 5, frequency: 440 }, note2, 1);

        expect(playerNotes).toContainEqual(expect.objectContaining({ length: 1, distance: 0, note: note1 }));
        expect(playerNotes).toContainEqual(expect.objectContaining({ length: 1, distance: 0, note: note2 }));
    });

    it('should append records of different frequencies for the same freestyle note into same note', () => {
        const playerNotes: PlayerNote[] = [];
        const note: Note = generateNote(0, 3, { pitch: 69, type: 'freestyle' });

        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 0, frequency: 440 }, note, 1);
        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 1, frequency: 320 }, note, 1);
        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 2, frequency: 380 }, note, 1);
        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 3, frequency: 440 }, note, 1);

        expect(playerNotes).toContainEqual(expect.objectContaining({ length: 3, distance: 0, note }));
    });

    it('should start player note in half of the note length if singing started late', () => {
        const playerNotes: PlayerNote[] = [];
        const note: Note = generateNote(0, 6, { pitch: 69 });

        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 3, frequency: 440 }, note, 1);
        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 4, frequency: 440 }, note, 1);
        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 5, frequency: 440 }, note, 1);
        appendFrequencyToPlayerNotes(playerNotes, { timestamp: 6, frequency: 440 }, note, 1);

        expect(playerNotes).toContainEqual(expect.objectContaining({ length: 3, start: 3, distance: 0 }));
    });

    describe('note joining', () => {
        it('should join notes if sung frequencies are close', () => {
            const playerNotes: PlayerNote[] = [];
            const note: Note = generateNote(0, 5, { pitch: 69 });

            appendFrequencyToPlayerNotes(playerNotes, { timestamp: 0, frequency: 440 }, note, 100);
            appendFrequencyToPlayerNotes(playerNotes, { timestamp: 100, frequency: 440 }, note, 100);
            appendFrequencyToPlayerNotes(playerNotes, { timestamp: 150, frequency: 0 }, note, 100);
            appendFrequencyToPlayerNotes(playerNotes, { timestamp: 200, frequency: 440 }, note, 100);
            appendFrequencyToPlayerNotes(playerNotes, { timestamp: 300, frequency: 440 }, note, 100);

            expect(playerNotes).toContainEqual(expect.objectContaining({ length: 3, start: 0, distance: 0 }));
        });
        it('should disjoin notes if sung frequencies are too far apart', () => {
            const playerNotes: PlayerNote[] = [];
            const note: Note = generateNote(0, 5, { pitch: 69 });

            appendFrequencyToPlayerNotes(playerNotes, { timestamp: 0, frequency: 440 }, note, 100);
            appendFrequencyToPlayerNotes(playerNotes, { timestamp: 100, frequency: 440 }, note, 100);
            appendFrequencyToPlayerNotes(playerNotes, { timestamp: 200, frequency: 0 }, note, 100);
            appendFrequencyToPlayerNotes(playerNotes, { timestamp: 300, frequency: 0 }, note, 100);
            appendFrequencyToPlayerNotes(playerNotes, { timestamp: 400, frequency: 440 }, note, 100);
            appendFrequencyToPlayerNotes(playerNotes, { timestamp: 500, frequency: 440 }, note, 100);

            expect(playerNotes).toContainEqual(expect.objectContaining({ length: 1, start: 0, distance: 0 }));
            expect(playerNotes).toContainEqual(expect.objectContaining({ length: 1, start: 4, distance: 0 }));
        });
    });
});
