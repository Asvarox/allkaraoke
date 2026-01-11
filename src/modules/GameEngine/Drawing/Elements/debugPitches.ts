import { calcDistance } from '~/modules/GameEngine/GameState/Helpers/calcDistance';
import isNotesSection from '~/modules/Songs/utils/isNotesSection';
import calculateData, { DrawingData, pitchPadding } from '../calculateData';

export default function debugPitches(ctx: CanvasRenderingContext2D, data: DrawingData) {
  const { currentSection, timeSectionGap, maxTime, pitchStepHeight, playerCanvas } = calculateData(data);
  const { frequencies, maxPitch, canvas, songBeatLength } = data;

  if (!isNotesSection(currentSection)) return;

  let previousNote: { pitch: number; lyrics: string } = currentSection.notes[0];

  ctx!.fillStyle = 'rgba(255, 255, 255, .25)';

  frequencies.forEach((entry) => {
    const regionPaddingTop = playerCanvas.baseY;

    const currentBeat = Math.max(0, Math.floor(entry.timestamp / songBeatLength));
    const noteAtTheTime =
      currentSection.notes.find((note) => note.start <= currentBeat && note.start + note.length > currentBeat) ??
      previousNote;
    previousNote = noteAtTheTime;

    if (noteAtTheTime === undefined) return;

    const entryRelativeTime = Math.max(0, entry.timestamp - timeSectionGap);
    const entryX =
      playerCanvas.baseX + (entryRelativeTime / maxTime) * (canvas!.width - playerCanvas.baseX - playerCanvas.baseX);

    const { distance: toleratedDistance } = calcDistance(entry.frequency, noteAtTheTime.pitch);
    const final = maxPitch - (noteAtTheTime.pitch + toleratedDistance) + pitchPadding;

    ctx?.fillRect(entryX, 10 + regionPaddingTop + final * pitchStepHeight, 5, 10);
  });
}
