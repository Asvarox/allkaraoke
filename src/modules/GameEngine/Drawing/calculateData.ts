import { FrequencyRecord, PlayerNote, Section, Song, SongTrack } from 'interfaces';
import isNotesSection from 'modules/Songs/utils/isNotesSection';

export const pitchPadding = 6;

export const NOTE_HEIGHT = 30;
export const BIG_NOTE_HEIGHT = NOTE_HEIGHT + 6;

const getPlayerCanvas = (
  drawingData: Pick<DrawingData, 'canvas' | 'playerCount' | 'playerIndex' | 'paddingVertical'>,
) => {
  const width = drawingData.canvas.width;
  const height = drawingData.canvas.height;

  // If the ratio is higher than 16/9 (e.g. 21/9), pad the excess horizontal space
  // so in the end the notes are drawn over the same area as it would be on 16/9
  const pixelsOverRatio = Math.max(0, (width - height * (16 / 9)) / 2);

  const paddingHorizontal = 10 + (width - 2 * pixelsOverRatio) * 0.15 + pixelsOverRatio;

  const paddedHeight = height - drawingData.paddingVertical * 2;

  return {
    width: width - paddingHorizontal * 2,
    height: paddedHeight / drawingData.playerCount,
    baseX: paddingHorizontal,
    baseY: drawingData.paddingVertical + (drawingData.playerIndex * paddedHeight) / drawingData.playerCount,
  };
};

export default function calculateData({
  canvas,
  currentSectionIndex,
  songBeatLength,
  minPitch,
  maxPitch,
  track,
  playerIndex,
  playerCount,
  paddingVertical,
}: DrawingData) {
  const sections = track.sections;
  const currentSection = sections[currentSectionIndex];
  const nextSection = sections[currentSectionIndex + 1];

  const playerCanvas = getPlayerCanvas({ canvas, playerCount, playerIndex, paddingVertical });

  const lastNote = isNotesSection(currentSection) ? currentSection?.notes?.at(-1) : undefined;
  const sectionEndBeat = isNotesSection(currentSection)
    ? nextSection?.start ?? lastNote!.start + lastNote!.length
    : currentSection.end;
  const timeSectionGap = currentSection.start * songBeatLength;
  const maxTime = (sectionEndBeat - currentSection.start) * songBeatLength;

  const pitchStepHeight = (playerCanvas.height - 20 - NOTE_HEIGHT) / (maxPitch - minPitch + pitchPadding * 2);

  return {
    playerCanvas,
    currentSection,
    sectionEndBeat,
    timeSectionGap,
    maxTime,
    pitchStepHeight,
  };
}

export interface DrawingData {
  playerNumber: 0 | 1 | 2 | 3;
  playerIndex: number;
  playerCount: number;
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
  track: SongTrack;

  currentBeat: number;
  paddingVertical: number;
  currentSection: Section | undefined; // `undefined` can happen with `sectionShift` parameter
}
