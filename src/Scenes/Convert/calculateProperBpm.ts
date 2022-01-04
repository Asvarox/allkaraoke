import { Song } from "../../interfaces";
import isNotesSection from "../Singing/Helpers/isNotesSection";

export default function calculateProperBPM(desiredEndMs: number, song: Song) {
    const notesSections = song.tracks[0].sections.filter(isNotesSection)

    const lastSection = notesSections[notesSections.length - 1];
    const lastNote = lastSection.notes[lastSection.notes.length - 1];
    
    const desiredLengthMs = desiredEndMs - song.gap;
    const bpmLength = lastNote.start + lastNote.length;

    return Number((60000 / (desiredLengthMs / bpmLength * song.bar)).toFixed(2));
}