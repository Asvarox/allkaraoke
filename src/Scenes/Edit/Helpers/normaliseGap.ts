import { Section, Song } from "../../../interfaces";
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
});

const getFirstNoteFromSection = (section: Section) => {
    if (!isNotesSection(section)) return section.start;

    return section.notes[0].start;
}

export default function normaliseGap(song: Song): Song {
    const beatLength = getSongBeatLength(song);

    const earliestTrack = song.tracks.reduce((current, track, index) => {
        const currentNoteStart = getFirstNoteFromSection(song.tracks[current].sections[0]);
        const thisNoteStart = getFirstNoteFromSection(track.sections[0]);
        return currentNoteStart > thisNoteStart ? index : current
    }, 0);

    const firstSection = song.tracks[earliestTrack].sections[0];
    let shiftBeats = 0;
    if (isNotesSection(firstSection)) {
        shiftBeats = firstSection.start + (firstSection.notes[0].start - firstSection.start);
    } else {
        console.error('There is a pause section at the beginning wat', firstSection);
        return song; // todo handle case when there's pause section at the beginning
    }
    
    const gap = Math.floor(song.gap + (shiftBeats * beatLength));

    
    return {
        ...song,
        gap,
        tracks: song.tracks.map(track => ({ ...track, sections: shiftSections(track.sections, shiftBeats) })),
    };
}