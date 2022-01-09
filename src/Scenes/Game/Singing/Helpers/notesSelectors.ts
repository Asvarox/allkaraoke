import { Section } from "../../../../interfaces";
import isNotesSection from "./isNotesSection";

export const getFirstNoteStartFromSections = (sections: Section[]) => {
    const firstNoteSection = sections.find(isNotesSection);

    return firstNoteSection ? firstNoteSection.notes[0].start : Infinity;
}
export const getLastNoteEndFromSections = (sections: Section[]) => {
    const notesSections = sections.filter(isNotesSection);
    const lastSection = notesSections[notesSections.length - 1];
    const lastNote = lastSection.notes[lastSection.notes.length - 1];

    return lastNote.start + lastNote.length;
}