import { Note, Song, SongTrack } from 'interfaces';
import isNotesSection from 'Songs/utils/isNotesSection';

const normaliseSpaces = (notes: Note[]): Note[] => {
  notes.forEach((note, index) => {
    if (note.lyrics.startsWith(' ')) {
      note.lyrics = note.lyrics.trim();

      if (index > 0) {
        notes[index - 1].lyrics = notes[index - 1].lyrics + ' ';
      }
    }
  });

  return notes;
};

const normaliseLyricSpacesForTrack = (track: SongTrack) => ({
  ...track,
  sections: track.sections.map((section) =>
    isNotesSection(section)
      ? {
          ...section,
          notes: normaliseSpaces(section.notes),
        }
      : section,
  ),
});

export default function normaliseLyricSpaces(song: Song) {
  return {
    ...song,
    tracks: song.tracks.map(normaliseLyricSpacesForTrack),
    mergedTrack: normaliseLyricSpacesForTrack(song.mergedTrack),
  };
}
