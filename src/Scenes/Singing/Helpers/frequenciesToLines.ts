import { Note, PitchRecord, RelativeLine } from "../../../interfaces";
import { calcDistance } from "./calcDistance";

export default function frequenciesToLines(frequencies: PitchRecord[], beatLength: number, gap: number, notes: Note[]): RelativeLine[] {
    const playerLines: RelativeLine[] = [];

    notes.forEach(note => playerLines.push(
        ...frequencies
            .map(({ timestamp, pitch }) => ({ pitch, timestamp: Math.max(0, timestamp - gap) / beatLength }))
            .filter(({ timestamp }) => timestamp >= note.start - 1 && timestamp <= note.start + note.length + 1)
            .map(({ timestamp, pitch }) => ({ timestamp, distance: calcDistance(pitch, note.pitch) }))
            .reduce<RelativeLine[]>((groups, playerLine) => {
                const lastGroup = groups[groups.length - 1];
                if (!lastGroup || lastGroup.distance !== playerLine.distance) {
                    groups.push({ start: Math.max(note.start, playerLine.timestamp), length: 0, distance: playerLine.distance, note, isPerfect: false })
                } else {
                    lastGroup.length = Math.min(playerLine.timestamp - lastGroup.start, note.start + note.length - lastGroup.start);
                }
    
                return groups;
            }, [])
            .filter(playerLine => playerLine.distance > -Infinity)
            .map(line => {
                line.isPerfect = line.distance === 0 && Math.abs(line.length - line.note.length) < .5;

                return line;
            })
    ));

    return playerLines;
}