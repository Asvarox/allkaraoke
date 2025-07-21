import { milliseconds, NotesSection, Section, Song, songBeat } from 'interfaces';
import getSongBeatLength from 'modules/Songs/utils/getSongBeatLength';
import isNotesSection from './isNotesSection';

export const getFirstNoteFromSection = (section: NotesSection) => {
  return section.notes[0];
};
export const getFirstNoteStartFromSections = (sections: Section[]): songBeat => {
  const firstNoteSection = sections.find(isNotesSection);

  return firstNoteSection ? getFirstNoteFromSection(firstNoteSection).start : Infinity;
};
export const getLastNoteEndFromSections = (sections: Section[]): songBeat => {
  const notesSections = sections.filter(isNotesSection);
  const lastSection = notesSections.at(-1);

  return lastSection ? getLastNoteEnd(lastSection) : 0;
};

export const getLastNoteEnd = (section: NotesSection): songBeat => {
  const lastNote = section.notes.at(-1)!;

  return lastNote.start + lastNote.length;
};

export const getNoteAtBeat = (section: NotesSection, beat: number, tolerance = 0) => {
  return section.notes.find((note) => note.start - tolerance <= beat && note.start + note.length + tolerance >= beat);
};

export function getSectionStart(section: Section): songBeat {
  return isNotesSection(section) ? section.notes[0].start : section.start;
}

export function getSectionStartInMs(section: Section, song: Song): milliseconds {
  return getSectionStart(section) * getSongBeatLength(song) + song.gap;
}

export function getLastNotesSection(sections: Section[]) {
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i];
    if (isNotesSection(section)) {
      return section;
    }
  }
  return undefined;
}
