import { NotesSection, Section, Song } from '../../../../interfaces';
import getSongBeatLength from '../GameState/Helpers/getSongBeatLength';
import isNotesSection from './isNotesSection';
import { getFirstNoteStartFromSections, getLastNoteEndFromSections } from './notesSelectors';

// Join sections into segments - group of sections that have shorter than 500ms pause between
export const segmentSections = (sections: Section[], beatLength: number): NotesSection[][] => {
    const [firstSection, ...noteSections] = sections.filter(isNotesSection);

    const segments: NotesSection[][] = [[firstSection]];

    noteSections.forEach((section) => {
        const lastSegment = segments[segments.length - 1];

        const lastSectionEnd = getLastNoteEndFromSections(lastSegment);
        const firstSectionNoteStart = getFirstNoteStartFromSections([section]);
        const difference = firstSectionNoteStart - lastSectionEnd;

        if (difference * beatLength > 500) {
            segments.push([section]);
        } else {
            lastSegment.push(section);
        }
    });

    return segments;
};

export default function generatePlayerChanges(song: Song): number[][] {
    const CHANGES_COUNT = 9;
    const beatLength = getSongBeatLength(song);

    return song.tracks.map((track) => {
        const segments = segmentSections(track.sections, beatLength);
        const sectionSize = Math.max(0, Math.floor(segments.length / (CHANGES_COUNT + 1)));

        if (sectionSize === 0) return [];

        const changes = [];
        for (let i = 1; i < CHANGES_COUNT + 1; i++) changes.push(segments[i * sectionSize][0].start);

        return changes;
    });
}
