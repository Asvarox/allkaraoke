import { FrequencyRecord, PlayerNote, Section, Song } from 'interfaces';
import isNotesSection from 'Songs/utils/isNotesSection';

export const pitchPadding = 6;

export const NOTE_HEIGHT = 30;
export const BIG_NOTE_HEIGHT = NOTE_HEIGHT + 6;

export default function calculateData({
    canvas,
    currentSectionIndex,
    song,
    songBeatLength,
    minPitch,
    maxPitch,
    track,
    paddingVertical,
}: DrawingData) {
    const sections = song.tracks[track].sections;
    const currentSection = sections[currentSectionIndex];
    const nextSection = sections[currentSectionIndex + 1];

    // If the ratio is higher than 16/9 (e.g. 21/9), pad the excess horizontal space
    // so in the end the notes are drawn over the same area as it would be on 16/9
    const pixelsOverRatio = Math.max(0, (canvas.width - canvas.height * (16 / 9)) / 2);

    const paddingHorizontal = 10 + (canvas.width - 2 * pixelsOverRatio) * 0.15 + pixelsOverRatio;
    const lastNote = isNotesSection(currentSection) ? currentSection?.notes?.at(-1) : undefined;
    const sectionEndBeat = isNotesSection(currentSection)
        ? nextSection?.start ?? lastNote!.start + lastNote!.length
        : currentSection.end;
    const timeSectionGap = currentSection.start * songBeatLength;
    const maxTime = (sectionEndBeat - currentSection.start) * songBeatLength;

    const canvasHeight = canvas.height - 2 * paddingVertical;

    const pitchStepHeight = (canvasHeight / 2 - 20 - NOTE_HEIGHT) / (maxPitch - minPitch + pitchPadding * 2);

    return {
        canvasHeight,
        paddingHorizontal,
        currentSection,
        sectionEndBeat,
        timeSectionGap,
        maxTime,
        pitchStepHeight,
    };
}

export interface DrawingData {
    playerNumber: number;
    song: Song;
    songBeatLength: number;
    minPitch: number;
    maxPitch: number;
    canvas: HTMLCanvasElement;
    currentTime: number;
    currentSectionIndex: number;
    frequencies: FrequencyRecord[];
    playerNotes: PlayerNote[];
    currentPlayerNotes: PlayerNote[];
    track: number;

    currentBeat: number;
    paddingVertical: number;
    currentSection: Section | undefined; // `undefined` can happen with `sectionShift` parameter
}
