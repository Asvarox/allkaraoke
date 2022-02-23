import { calcDistance } from '../GameState/Helpers/calcDistance';
import isNotesSection from '../Helpers/isNotesSection';
import calculateData, { DrawingData, pitchPadding } from './calculateData';

export default function debugPitches(ctx: CanvasRenderingContext2D, data: DrawingData) {
    const { currentSection, paddingHorizontal, timeSectionGap, maxTime, pitchStepHeight } = calculateData(data);
    const { frequencies, maxPitch, canvas, songBeatLength, playerNumber } = data;

    if (!isNotesSection(currentSection)) return;

    let previousNote: { pitch: number; lyrics: string } = currentSection.notes[0];

    ctx!.fillStyle = 'rgba(255, 255, 255, .25)';

    frequencies.forEach((entry) => {
        const regionPaddingTop = playerNumber * canvas.height * 0.5;

        const currentBeat = Math.max(0, Math.floor(entry.timestamp / songBeatLength));
        const noteAtTheTime =
            currentSection.notes.find((note) => note.start <= currentBeat && note.start + note.length > currentBeat) ??
            previousNote;
        previousNote = noteAtTheTime;

        if (noteAtTheTime === undefined) return;

        const entryRelativeTime = Math.max(0, entry.timestamp - timeSectionGap);
        const entryX =
            paddingHorizontal + (entryRelativeTime / maxTime) * (canvas!.width - paddingHorizontal - paddingHorizontal);

        const { distance: toleratedDistance } = calcDistance(entry.frequency, noteAtTheTime.pitch);
        const final = maxPitch - (noteAtTheTime.pitch + toleratedDistance) + pitchPadding;

        ctx?.fillRect(entryX, 10 + regionPaddingTop + final * pitchStepHeight, 5, 10);
    });
}
