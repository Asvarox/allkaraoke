import { NotesSection, Section } from 'interfaces';
import isNotesSection from 'Songs/utils/isNotesSection';

export const getFirstNoteStartFromSections = (sections: Section[]) => {
    const firstNoteSection = sections.find(isNotesSection);

    return firstNoteSection ? firstNoteSection.notes[0].start : Infinity;
};
export const getLastNoteEndFromSections = (sections: Section[]) => {
    const notesSections = sections.filter(isNotesSection);
    const lastSection = notesSections.at(-1);

    return lastSection ? getLastNoteEnd(lastSection) : 0;
};

export const getLastNoteEnd = (section: NotesSection) => {
    const lastNote = section.notes.at(-1)!;

    return lastNote.start + lastNote.length;
};

export const getNoteAtBeat = (section: NotesSection, beat: number, tolerance = 0) => {
    return section.notes.find((note) => note.start - tolerance <= beat && note.start + note.length + tolerance >= beat);
};
