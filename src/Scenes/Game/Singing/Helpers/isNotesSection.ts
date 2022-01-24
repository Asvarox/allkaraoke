import { NotesSection, Section } from '../../../../interfaces';

export default function isNotesSection(section: Section | undefined | null): section is NotesSection {
    return section?.type === 'notes' && !!section.notes.length;
}
