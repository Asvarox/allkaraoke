import { Section, Song } from "../../../interfaces";
import { getFirstNoteStartFromSections } from "../../Game/Singing/Helpers/notesSelectors";
import getSongBeatLength from "../../Game/Singing/Helpers/getSongBeatLength"
import isNotesSection from "../../Game/Singing/Helpers/isNotesSection";

const shiftSections = (sections: Section[], shiftBeats: number): Section[] => sections.map((section, index) => {
    if (isNotesSection(section)) {
        return {
            ...section,
            start: index === 0 ? 0 : Math.max(0, section.start - shiftBeats), // first section might be 0
            notes: section.notes.map(note => ({ ...note, start: note.start - shiftBeats })),
        };
    } else {
        return {
            ...section,
            start: Math.max(0, section.start - shiftBeats), // first section might be 0
            end: Math.max(0, section.end - shiftBeats), // first section might be 0
        }
    }
}).filter(section => isNotesSection(section) || section.start - section.end > 0); // clear empty pause sections

export default function normaliseGap(song: Song): Song {
    const beatLength = getSongBeatLength(song);

    const earliestTrack = song.tracks.reduce((current, track, index) => {
        const currentNoteStart = getFirstNoteStartFromSections(song.tracks[current].sections);
        const thisNoteStart = getFirstNoteStartFromSections(track.sections);
        return currentNoteStart > thisNoteStart ? index : current
    }, 0);

    const firstSection = song.tracks[earliestTrack].sections.find(isNotesSection);
    
    if (!firstSection) {
        console.error('There are no notes sections in the song, wat', song.tracks);
        return song;
    }

    const shiftBeats = firstSection.start + (firstSection.notes[0].start - firstSection.start);
    
    const gap = Math.floor(song.gap + (shiftBeats * beatLength));

    
    return {
        ...song,
        gap,
        tracks: song.tracks.map(track => ({ ...track, sections: shiftSections(track.sections, shiftBeats) })),
    };
}