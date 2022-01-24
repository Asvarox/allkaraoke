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
});
