import { FrequencyRecord, Note, PlayerNote } from '../../../../../interfaces';
import { calcDistance } from './calcDistance';
import detectVibrato from './detectVibrato';

export function appendFrequencyToPlayerNotes(
    playerNotes: PlayerNote[],
    record: FrequencyRecord,
    note: Note,
    beatLength: number,
) {
    const noteCandidate = {
        ...record,
        beat: Math.max(0, record.timestamp) / beatLength,
        distance: calcDistance(record.frequency, note.pitch),
    };
    const lastGroup = playerNotes[playerNotes.length - 1];

    if (!lastGroup || lastGroup.distance !== noteCandidate.distance || note.start !== lastGroup.note.start) {
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
