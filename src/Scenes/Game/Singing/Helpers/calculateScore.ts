import { RelativeLine, Song } from "../../../../interfaces";
import { memoize } from 'lodash';
import isNotesSection from "./isNotesSection";

const MAX_BASE_POINTS = 2500000;

const countSungBeats = memoize((song: Song) => {
    let count = 0;

    song.tracks[0].sections.filter(isNotesSection).forEach(section => count = section.notes.reduce((acc, note) => acc + note.length, count));

    return count;
});

export default function calculateScore(lines: RelativeLine[], song: Song): string {
    const beatsCount = countSungBeats(song);

    const hitBeats = lines
        .filter(line => line.distance === 0)
        .reduce((sum, line) => sum + line.length, 0);

    return ((hitBeats / beatsCount) * MAX_BASE_POINTS).toLocaleString(undefined, { maximumFractionDigits: 0 });
}