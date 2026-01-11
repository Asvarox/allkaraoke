import { milliseconds, NotesSection, Section, Song, songBeat } from '~/interfaces';
import getSongBeatLength from './getSongBeatLength';
import isNotesSection from './isNotesSection';

export const getFirstNoteFromSection = (sections: Section[]) => {
  const firstNoteSection = sections.find(isNotesSection);
  return firstNoteSection?.notes[0];
};
export const getFirstNoteStartFromSections = (sections: Section[]): songBeat => {
  return (getFirstNoteFromSection(sections)?.start ?? Infinity) as songBeat;
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

export const getNoteAtBeat = (section: NotesSection, beat: songBeat, tolerance = 0) => {
  return section.notes.find((note) => note.start - tolerance <= beat && note.start + note.length + tolerance >= beat);
};

export function getSectionStart(section: Section): songBeat {
  return isNotesSection(section) ? section.notes[0].start : section.start;
}

export const getSectionEnd = (section: Section): songBeat => {
  return isNotesSection(section) ? getLastNoteEnd(section) : section.end;
};

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
