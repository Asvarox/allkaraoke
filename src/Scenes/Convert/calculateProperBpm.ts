import { Song } from 'interfaces';
import isNotesSection from 'Songs/utils/isNotesSection';

export default function calculateProperBPM(desiredEndMs: number, song: Song) {
    const notesSections = song.tracks[0].sections.filter(isNotesSection);

    const lastNote = notesSections.at(-1)?.notes.at(-1)!;

    const desiredLengthMs = desiredEndMs - song.gap;
    const bpmLength = lastNote.start + lastNote.length;

    return Number((60_000 / ((desiredLengthMs / bpmLength) * song.bar)).toFixed(2));
}
