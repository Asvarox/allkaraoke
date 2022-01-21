import { FrequencyRecord, Note, PlayerNote } from '../../../../interfaces';
import { calcDistance } from './calcDistance';
import detectVibrato from './detectVibrato';

export default function frequenciesToLines(
    frequencies: FrequencyRecord[],
    beatLength: number,
    gap: number,
    notes: Note[],
): PlayerNote[] {
    const playerNotes: PlayerNote[] = [];

    notes.forEach((note) =>
        playerNotes.push(
            ...frequencies
                .map(({ timestamp, frequency }) => ({
                    frequency,
                    timestamp,
                    beat: Math.max(0, timestamp - gap) / beatLength,
                }))
                .filter(({ beat }) => beat >= note.start - 0.5 && beat <= note.start + note.length + 0.5)
                .map(({ beat, timestamp, frequency }) => ({
                    beat,
                    timestamp,
                    frequency,
                    distance: calcDistance(frequency, note.pitch),
                }))
                .reduce<PlayerNote[]>((groups, playerNote) => {
                    const lastGroup = groups[groups.length - 1];
                    if (!lastGroup || lastGroup.distance !== playerNote.distance) {
                        groups.push({
                            start: Math.min(Math.max(note.start, playerNote.beat), note.start + note.length),
                            length: 0,
                            distance: playerNote.distance,
                            note,
                            isPerfect: false,
                            vibrato: false,
                            frequencyRecords: [{ frequency: playerNote.frequency, timestamp: playerNote.timestamp }],
                        });
                    } else {
                        lastGroup.length = Math.max(
                            0,
                            Math.min(playerNote.beat - lastGroup.start, note.start + note.length - lastGroup.start),
                        );
                        lastGroup.frequencyRecords.push({
                            frequency: playerNote.frequency,
                            timestamp: playerNote.timestamp,
                        });
                    }

                    return groups;
                }, [])
                .filter((playerNote) => playerNote.distance > -Infinity && playerNote.length > 0)
                .map((playerNote) => {
                    playerNote.isPerfect =
                        playerNote.distance === 0 && Math.abs(playerNote.length - playerNote.note.length) < 0.5;

                    playerNote.vibrato = playerNote.distance === 0 && detectVibrato(playerNote.frequencyRecords);

                    return playerNote;
                }),
        ),
    );

    return playerNotes;
}
