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
        distance: calcDistance(record.frequency, note.pitch),
    };
    const lastGroup = playerNotes[playerNotes.length - 1];

    const breakToleranceBeat = SINGING_BREAK_TOLERANCE_MS / beatLength;

    if (
        !lastGroup ||
        lastGroup.distance !== noteCandidate.distance ||
        note.start !== lastGroup.note.start ||
        noteCandidate.beat - (lastGroup.start + lastGroup.length) > breakToleranceBeat
    ) {
        playerNotes.push({
            start: Math.min(Math.max(note.start, noteCandidate.beat), note.start + note.length),
            length: 0,
            distance: noteCandidate.distance,
            note,
            isPerfect: false,
            vibrato: false,
            frequencyRecords: [{ frequency: noteCandidate.frequency, timestamp: noteCandidate.timestamp }],
        });
    } else {
        lastGroup.length = Math.max(
            0,
            Math.min(noteCandidate.beat - lastGroup.start, note.start + note.length - lastGroup.start),
        );
        lastGroup.frequencyRecords.push({
            frequency: noteCandidate.frequency,
            timestamp: noteCandidate.timestamp,
        });

        lastGroup.isPerfect = lastGroup.distance === 0 && Math.abs(lastGroup.length - lastGroup.note.length) < 0.5;

        lastGroup.vibrato = lastGroup.distance === 0 && detectVibrato(lastGroup.frequencyRecords);
    }
}
