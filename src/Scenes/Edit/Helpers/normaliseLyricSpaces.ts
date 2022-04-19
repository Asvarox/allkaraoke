import { Note, Song } from 'interfaces';
import isNotesSection from '../../Game/Singing/Helpers/isNotesSection';

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

export default function normaliseLyricSpaces(song: Song) {
    return {
        ...song,
        tracks: song.tracks.map((track) => ({
            ...track,
            sections: track.sections.map((section) =>
                isNotesSection(section)
                    ? {
                          ...section,
                          notes: normaliseSpaces(section.notes),
                      }
                    : section,
            ),
        })),
    };
}
