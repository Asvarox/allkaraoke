import { FrequencyRecord, PlayerNote, Song } from '../../../../interfaces';
import isNotesSection from '../Helpers/isNotesSection';

export const pitchPadding = 6;

export const NOTE_HEIGHT = 20;

export default function calculateData({
    canvas,
    currentSectionIndex,
    song,
    songBeatLength,
    minPitch,
    maxPitch,
    track,
}: DrawingData) {
    const sections = song.tracks[track].sections;
    const currentSection = sections[currentSectionIndex];
    const nextSection = sections[currentSectionIndex + 1];

    const paddingHorizontal = 10 + canvas.width * 0.15;
    const lastNote = isNotesSection(currentSection) ? currentSection?.notes?.at(-1) : undefined;
    const sectionEndBeat = isNotesSection(currentSection)
        ? nextSection?.start ?? lastNote!.start + lastNote!.length
        : currentSection.end;
    const timeSectionGap = currentSection.start * songBeatLength;
    const maxTime = (sectionEndBeat - currentSection.start) * songBeatLength;

    const pitchStepHeight = (canvas.height * 0.5 - 20 - NOTE_HEIGHT) / (maxPitch - minPitch + pitchPadding * 2);

    return {
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
    playersNotes: PlayerNote[];
    track: number;
    regionPaddingTop: number;
    regionHeight: number;
}
