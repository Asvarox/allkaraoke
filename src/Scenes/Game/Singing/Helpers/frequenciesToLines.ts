import { Note, FrequencyRecord, PlayerNote } from "../../../../interfaces";
import { calcDistance } from "./calcDistance";

export default function frequenciesToLines(frequencies: FrequencyRecord[], beatLength: number, gap: number, notes: Note[]): PlayerNote[] {
    const playerNotes: PlayerNote[] = [];

    notes.forEach(note => playerNotes.push(
        ...frequencies
            .map(({ timestamp, frequency }) => ({ frequency, timestamp: Math.max(0, timestamp - gap) / beatLength }))
            .filter(({ timestamp }) => timestamp >= note.start - 1 && timestamp <= note.start + note.length + 1)
            .map(({ timestamp, frequency }) => ({ timestamp, distance: calcDistance(frequency, note.pitch) }))
            .reduce<PlayerNote[]>((groups, playerNote) => {
                const lastGroup = groups[groups.length - 1];
                if (!lastGroup || lastGroup.distance !== playerNote.distance) {
                    groups.push({ start: Math.max(note.start, playerNote.timestamp), length: 0, distance: playerNote.distance, note, isPerfect: false })
                } else {
                    lastGroup.length = Math.min(playerNote.timestamp - lastGroup.start, note.start + note.length - lastGroup.start);
                }
    
                return groups;
            }, [])
            .filter(playerNote => playerNote.distance > -Infinity)
            .map(playerNote => {
                playerNote.isPerfect = playerNote.distance === 0 && Math.abs(playerNote.length - playerNote.note.length) < .5;

                return playerNote;
            })
    ));

    return playerNotes;
}