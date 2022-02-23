import { noDistanceNoteTypes } from '../../../../../consts';
import { FrequencyRecord, Note, PlayerNote } from '../../../../../interfaces';
import { calcDistance } from './calcDistance';
import detectVibrato from './detectVibrato';

const SINGING_BREAK_TOLERANCE_MS = 100;

export function appendFrequencyToPlayerNotes(
    playerNotes: PlayerNote[],
    record: FrequencyRecord,
    note: Note,
    beatLength: number,
) {
    if (record.frequency === 0) return;
    const noteCandidate = {
        ...record,
        beat: Math.max(0, record.timestamp) / beatLength,
        ...calcDistance(record.frequency, note.pitch),
    };
    const lastNote = playerNotes[playerNotes.length - 1];

    const breakToleranceBeat = SINGING_BREAK_TOLERANCE_MS / beatLength;

    const noteEndBeat = note.start + note.length;
    const isThisNoteDifferentThanLast = !lastNote || lastNote.note.start !== note.start;
    const isDistanceDifferent =
        lastNote.distance !== noteCandidate.distance && !noDistanceNoteTypes.includes(note.type);

    if (
        isThisNoteDifferentThanLast ||
        isDistanceDifferent ||
        noteCandidate.beat - (lastNote.start + lastNote.length) > breakToleranceBeat
    ) {
        const roundedStart = noteCandidate.beat - breakToleranceBeat < note.start ? note.start : noteCandidate.beat;
        playerNotes.push({
            // If this is the first player note for the note, round player note start to note's start
            start: Math.min(isThisNoteDifferentThanLast ? roundedStart : noteCandidate.beat, noteEndBeat),
            length: 0,
            distance: noteCandidate.distance,
            note,
            isPerfect: false,
            vibrato: false,
            frequencyRecords: [
                {
                    frequency: noteCandidate.frequency,
                    preciseDistance: noteCandidate.preciseDistance,
                    timestamp: noteCandidate.timestamp,
                },
            ],
        });

        // Round the last player note length to the end of the note, so it looks a bit smoother
        if (lastNote && note.start !== lastNote.note.start) {
            const lastPlayerNoteEndBeat = lastNote.start + lastNote.length;
            const lastNoteEndBeat = lastNote.note.start + lastNote.note.length;
            const roundedLength =
                lastPlayerNoteEndBeat + breakToleranceBeat > lastNoteEndBeat ? lastNoteEndBeat : lastPlayerNoteEndBeat;
            lastNote.length = Math.max(0, roundedLength - lastNote.start);
        }
    } else {
        lastNote.length = Math.min(noteCandidate.beat, note.start + note.length) - lastNote.start;
        lastNote.frequencyRecords.push({
            frequency: noteCandidate.frequency,
            timestamp: noteCandidate.timestamp,
            preciseDistance: noteCandidate.preciseDistance,
        });

        lastNote.isPerfect = lastNote.distance === 0 && Math.abs(lastNote.length - lastNote.note.length) < 0.5;

        lastNote.vibrato = lastNote.distance === 0 && detectVibrato(lastNote.frequencyRecords);
    }
}
