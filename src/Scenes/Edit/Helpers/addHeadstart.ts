import { Section, Song } from "../../../interfaces";
import { getFirstNoteStartFromSections } from "../../Game/Singing/Helpers/notesSelectors";
import getSongBeatLength from "../../Game/Singing/Helpers/getSongBeatLength"
import isNotesSection from "../../Game/Singing/Helpers/isNotesSection";
import { HEADSTART_MS } from "./normaliseSectionPaddings";

const shiftSections = (sections: Section[], shiftBeats: number): Section[] => sections.map((section, index) => {
    if (isNotesSection(section)) {
        return {
            ...section,
            start: index === 0 ? 0 : Math.max(0, section.start + shiftBeats), // first section might be 0
            notes: section.notes.map(note => ({ ...note, start: note.start + shiftBeats })),
        };
    } else {
        return {
            ...section,
            start: Math.max(0, section.start + shiftBeats), // first section might be 0
            end: Math.max(0, section.end + shiftBeats), // first section might be 0
        }
    }
});

export default function addHeadstart(song: Song): Song {
    const beatLength = getSongBeatLength(song);
    const desiredHeadstart = Math.round(HEADSTART_MS / beatLength);
    const actualHeadstart = Math.floor((song.gap - (desiredHeadstart * beatLength) < 0 ? song.gap : (desiredHeadstart * beatLength)) / beatLength);

    const gap = song.gap - (actualHeadstart * beatLength);
    
    return {
        ...song,
        gap,
        tracks: song.tracks.map(track => ({ ...track, sections: shiftSections(track.sections, actualHeadstart) })),
    };
}