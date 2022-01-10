import { NotesSection, Section, Song } from "../../../interfaces";
import getSongBeatLength from "../../Game/Singing/Helpers/getSongBeatLength";
import isNotesSection from "../../Game/Singing/Helpers/isNotesSection";

const HEADSTART_MS = 1000;

const shortenNoteSections = (sections: NotesSection[]): NotesSection[] => sections.map(section => {
    if (section.notes.length === 0) {
        debugger;
    }
    return ({
    ...section,
    start: section.notes[0].start
})});

const getSectionEnd = (section: NotesSection) => {
    const lastNote = section.notes[section.notes.length - 1]
    return lastNote.start + lastNote.length;
}

const addPauseSections = (sections: NotesSection[], padSizeBeats = 10): Section[] => {
    let lastEnd = -padSizeBeats;
    let sectionsWithPauses: Section[] = [];

    sections.forEach(section => {
        const paddedStart = Math.min(lastEnd + padSizeBeats, section.start - padSizeBeats);

        if (section.start > lastEnd && paddedStart > lastEnd && section.start - paddedStart >= padSizeBeats) {
            sectionsWithPauses.push({ type: 'pause', start: paddedStart, end: section.start });
        }
        lastEnd = getSectionEnd(section);
        sectionsWithPauses.push(section);
    });

    return sectionsWithPauses;
}


const padSections = (sections: NotesSection[], padSizeBeats = 10): NotesSection[] => {
    let lastEnd = 0;

    return sections.map(section => {
        const newStart = Math.max(lastEnd, section.start - padSizeBeats);
        lastEnd = getSectionEnd(section);
        return {
            ...section,
            start: newStart,
        }
    })
}

// Triest its best to add enough headstart to sections so the player can see the lyrics and notes
// in advance. If possible, will also make the section a bit longer so it doesn't end abruptly
export default function normaliseSectionPaddings(song: Song): Song {
    const beatLength = getSongBeatLength(song);
    const desiredPadding = Math.round(HEADSTART_MS / beatLength);

    return {
        ...song,
        tracks: song.tracks.map(track => ({
            ...track,
            sections: addPauseSections(padSections(shortenNoteSections(track.sections.filter(isNotesSection)), desiredPadding), desiredPadding),
        })),
    }
}