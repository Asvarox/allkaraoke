import { NotesSection, Song, SongTrack } from 'interfaces';
import clearString from '../../utils/clearString';
import { generatePlayerChangesForTrack } from './generatePlayerChanges';
import isNotesSection from './isNotesSection';
import { getLastNoteEnd } from './notesSelectors';

const isBetween = (start: number, end: number, value: number) => value >= start && value <= end;

const notesLyricsLength = (section: NotesSection) => section.notes.map((n) => n.lyrics).join('');

/// unique characters in string
const uniqueCharactersCount = (str: string) => {
  const uniqueChars = new Set(clearString(str));
  return uniqueChars.size;
};

const sectionHasMoreLyrics = (sections: NotesSection[], section: NotesSection) => {
  const sectionsLyrics = sections.reduce((acc, s) => `${acc}${notesLyricsLength(s)}`, '');
  const lyrics = notesLyricsLength(section);

  return uniqueCharactersCount(sectionsLyrics) / uniqueCharactersCount(lyrics) < 0.5;
};

const isSectionOverlapping = (sections: NotesSection[], section: NotesSection) => {
  const sectionStart = section.start;
  const sectionEnd = getLastNoteEnd(section);

  const result = sections.filter((s) => {
    const start = s.start;
    const end = getLastNoteEnd(s);
    return (
      isBetween(sectionStart, sectionEnd, start) ||
      isBetween(sectionStart, sectionEnd, end) ||
      (start <= sectionStart && end >= sectionEnd)
    );
  });

  const moreLyrics = sectionHasMoreLyrics(result, section);

  return {
    section,
    shouldReplace: result.length === 0 || moreLyrics,
    sectionsToRemove: result,
  };
};

export default function mergeTracks(tracks: Song['tracks'], song: Song) {
  if (!tracks || tracks.length === 1) {
    return tracks[0];
  }
  const notesSections = tracks.map((track) => track.sections.filter(isNotesSection));

  const notOverlappingSections = notesSections[1].map((section) => isSectionOverlapping(notesSections[0], section));

  let finalSections = [...notesSections[0]];

  notOverlappingSections.forEach((section, index) => {
    if (section.shouldReplace) {
      finalSections = finalSections.filter(
        (s) => !section.sectionsToRemove.some((removedSection) => removedSection.start === s.start),
      );
      finalSections.push(section.section);
    }
  });

  const finalTrack: SongTrack = {
    ...tracks[0],
    sections: finalSections.sort((a, b) => a.start - b.start),
    changes: [],
  };

  finalTrack.changes = generatePlayerChangesForTrack(finalTrack, song);

  return finalTrack;
}
