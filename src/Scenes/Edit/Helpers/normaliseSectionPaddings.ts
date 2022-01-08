import { NotesSection, Section, Song } from "../../../interfaces";
import getSongBeatLength from "../../Game/Singing/Helpers/getSongBeatLength";
import isNotesSection from "../../Game/Singing/Helpers/isNotesSection";

const shortenNoteSections = (sections: NotesSection[]): NotesSection[] => sections.map(section => ({
    ...section,
    start: section.notes[0].start
}));

const getSectionEnd = (section: NotesSection) => {
    const lastNote = section.notes[section.notes.length - 1]
    return lastNote.start + lastNote.length;
}

const addPauseSections = (sections: NotesSection[], padSizeBeats = 10): Section[] => {
    let lastEnd = 0;
    let sectionsWithPauses: Section[] = [];

    sections.forEach(section => {
        const paddedStart = Math.max(Math.min(lastEnd + padSizeBeats, section.start - padSizeBeats));
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

export default function trimSections(song: Song): Song {
    const beatLength = getSongBeatLength(song);
    const desiredPadding = Math.round(1000 / beatLength);

    return {
        ...song,
        tracks: song.tracks.map(track => ({
            ...track,
            sections: addPauseSections(padSections(shortenNoteSections(track.sections.filter(isNotesSection)), desiredPadding), desiredPadding),
        })),
    }
}