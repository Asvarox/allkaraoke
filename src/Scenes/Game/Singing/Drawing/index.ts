import { noDistanceNoteTypes } from '../../../../consts';
import { FrequencyRecord, PlayerNote, Song } from '../../../../interfaces';
import getCurrentBeat from '../Helpers/getCurrentBeat';
import isNotesSection from '../Helpers/isNotesSection';
import calculateData, { DrawingData, NOTE_HEIGHT, pitchPadding } from './calculateData';
import roundRect from './roundRect';
import styles from './styles';
import drawTimeIndicator from './timeIndicator';

function applyColor(ctx: CanvasRenderingContext2D, style: { fill: string; stroke: string; lineWidth: number }) {
    ctx.fillStyle = style.fill;
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.lineWidth;
}

export default function drawFrame(
    playerNumber: number,
    song: Song,
    track: number,
    songBeatLength: number,
    minPitch: number,
    maxPitch: number,
    canvas: HTMLCanvasElement,
    currentTime: number,
    currentSectionIndex: number,
    frequencies: FrequencyRecord[],
    playersNotes: PlayerNote[],
) {
    if (currentSectionIndex < 0) {
        console.error(`currentSection is negative`, playerNumber, track, currentTime);
        return;
    }
    const regionPaddingTop = playerNumber * canvas.height * 0.5;
    const regionHeight = canvas.height * 0.5;

    const drawingData: DrawingData = {
        song,
        songBeatLength,
        minPitch,
        maxPitch,
        canvas,
        currentTime,
        currentSectionIndex,
        frequencies,
        playersNotes,
        playerNumber,
        track,
        regionPaddingTop,
        regionHeight,
    };

    const { sectionEndBeat, currentSection, paddingHorizontal, pitchStepHeight } = calculateData(drawingData);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawTimeIndicator(ctx, drawingData);

    const beatLength = (canvas.width - 2 * paddingHorizontal) / (sectionEndBeat - currentSection.start);

    if (!isNotesSection(currentSection)) {
        return;
    }

    const currentBeat = getCurrentBeat(currentTime, songBeatLength, song.gap);

    const displacements: Record<number, [number, number]> = {};

    currentSection.notes.forEach((note) => {
        if (note.type === 'star') {
            applyColor(ctx, styles.colors.lines.gold);
        } else if (note.type === 'freestyle' || note.type === 'rap') {
            applyColor(ctx, styles.colors.lines.freestyle);
        } else {
            applyColor(ctx, styles.colors.lines.normal);
        }

        const sungNotesStreak = playersNotes
            .filter((sungNote) => sungNote.note.start === note.start)
            .filter(
                (sungNote) => sungNote.note.start + sungNote.note.length + 30 >= currentBeat && sungNote.distance === 0,
            )
            .map((sungNote) =>
                sungNote.start + 30 < currentBeat
                    ? sungNote.length - (currentBeat - 30 - sungNote.start)
                    : sungNote.length,
            )
            .reduce((currLength, sungNoteLength) => Math.min(currLength + sungNoteLength, 30), 0);

        const displacementRange = Math.max(0, (sungNotesStreak - 5) / (note.type === 'star' ? 3 : 5));
        const displacementX = (Math.random() - 0.5) * displacementRange;
        const displacementY = (Math.random() - 0.5) * displacementRange;

        displacements[note.start] = [displacementX, displacementY];

        roundRect(
            ctx!,
            paddingHorizontal + beatLength * (note.start - currentSection.start) + displacementX,
            regionPaddingTop + 10 + pitchStepHeight * (maxPitch - note.pitch + pitchPadding) + displacementY - 3,
            beatLength * note.length,
            NOTE_HEIGHT + 5,
            5,
            true,
            true,
        );
    });

    playersNotes.forEach((playerNote) => {
        if (playerNote.isPerfect && playerNote.note.type === 'star') {
            applyColor(ctx, styles.colors.players[playerNumber].goldPerfect);
        } else if (playerNote.isPerfect) {
            applyColor(ctx, styles.colors.players[playerNumber].perfect);
        } else if (playerNote.note.type === 'star' && playerNote.distance === 0) {
            applyColor(ctx, styles.colors.players[playerNumber].gold);
        } else if (playerNote.distance === 0) {
            applyColor(ctx, styles.colors.players[playerNumber].hit);
        } else {
            applyColor(ctx, styles.colors.players[playerNumber].miss);
        }

        const startBeat = playerNote.start;
        const endBeat = playerNote.start + playerNote.length;

        const [displacementX, displacementY] = (playerNote.distance === 0 && displacements[playerNote.note.start]) || [
            0, 0,
        ];

        const distance = noDistanceNoteTypes.includes(playerNote.note.type) ? 0 : playerNote.distance;

        if (endBeat - startBeat >= 0.5)
            roundRect(
                ctx!,
                paddingHorizontal + beatLength * (playerNote.start - currentSection.start) + displacementX,
                regionPaddingTop +
                    10 +
                    pitchStepHeight * (maxPitch - playerNote.note.pitch - distance + pitchPadding) +
                    displacementY -
                    (distance === 0 ? 3 : 0),
                beatLength * (endBeat - startBeat),
                NOTE_HEIGHT + (distance === 0 ? 5 : 0),
                5,
                true,
                true,
            );
    });

    // debugPitches(ctx, drawingData);
}
