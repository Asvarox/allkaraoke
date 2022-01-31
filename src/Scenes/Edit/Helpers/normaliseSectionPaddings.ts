import { NotesSection, Section, Song } from '../../../interfaces';
import getSongBeatLength from '../../Game/Singing/GameState/Helpers/getSongBeatLength';
import isNotesSection from '../../Game/Singing/Helpers/isNotesSection';

export const HEADSTART_MS = 1000;

const shortenNoteSections = (sections: NotesSection[]): NotesSection[] =>
    sections.map((section) => {
        if (section.notes.length === 0) {
            debugger;
        }
        return {
            ...section,
            start: section.notes[0].start,
        };
    });

const getSectionEnd = (section: NotesSection) => {
    const lastNote = section.notes[section.notes.length - 1];
    return lastNote.start + lastNote.length;
};

const addPauseSections = (sections: NotesSection[], padSizeBeats = 10): Section[] => {
    let lastEnd = 0;
    let sectionsWithPauses: Section[] = [];

    sections.forEach((section) => {
        const spaceBetweenSections = section.start - lastEnd;

        if (spaceBetweenSections > padSizeBeats) {
            sectionsWithPauses.push({ type: 'pause', start: lastEnd, end: section.start - padSizeBeats });
            lastEnd = section.start - padSizeBeats;
        }
        sectionsWithPauses.push({ ...section, start: lastEnd });
        lastEnd = getSectionEnd(section);
    });

    return sectionsWithPauses;
};

// Triest its best to add enough headstart to sections so the player can see the lyrics and notes
// in advance. If possible, will also make the section a bit longer so it doesn't end abruptly
export default function normaliseSectionPaddings(song: Song): Song {
    const beatLength = getSongBeatLength(song);
    const desiredPadding = Math.round(HEADSTART_MS / beatLength);
    // const minPadding = Math.round(MIN_HEADSTART_MS / beatLength);

    return {
        ...song,
        tracks: song.tracks.map((track) => ({
            ...track,
            sections: addPauseSections(shortenNoteSections(track.sections.filter(isNotesSection)), desiredPadding),
        })),
    };
}
