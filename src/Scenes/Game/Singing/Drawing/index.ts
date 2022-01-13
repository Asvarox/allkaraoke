import { FrequencyRecord, PlayerNote, Song } from '../../../../interfaces';
import roundRect from './roundRect';
import styles from './styles';
import isNotesSection from '../Helpers/isNotesSection';
import drawTimeIndicator from './timeIndicator';
import calculateData, { DrawingData, NOTE_HEIGHT, pitchPadding } from './calculateData';
import debugPitches from './debugPitches';
import getCurrentBeat from '../Helpers/getCurrentBeat';

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

    const calcDisplacement = () => {
        const currentBeat = getCurrentBeat(currentTime, songBeatLength, song.gap);
        let lastStreakLength = 0;
        let lastStreakEnd = 0;
        for (let i = playersNotes.length - 1; i >= 0; i--) {
            if (lastStreakLength > 0 && playersNotes[i].distance > 0) break;
            if (playersNotes[i].distance !== 0) continue;
            if (playersNotes[i].note.start + playersNotes[i].note.length + 30 < currentBeat) break;

            lastStreakLength = lastStreakLength + playersNotes[i].length;
            lastStreakEnd = lastStreakEnd === 0 ? playersNotes[i].start + playersNotes[i].length : lastStreakEnd;
        }
        const beatsSinceLastHitNote = Math.max(0, currentBeat - lastStreakEnd);
        const maxDisplacement = 1 *  Math.min(Math.max(0, lastStreakLength - (beatsSinceLastHitNote * 1) - 15), 4);

        return [(Math.random() - .5) * maxDisplacement, (Math.random() - .5) * maxDisplacement];
    }

    const [displacementX, displacementY] = calcDisplacement();
    const [displacement2X, displacement2Y] = calcDisplacement();

    currentSection.notes.forEach((note) => {
        if (note.type === 'star') {
            applyColor(ctx, styles.colors.lines.gold);
        } else {
            applyColor(ctx, styles.colors.lines.normal);
        }

        roundRect(
            ctx!,
            paddingHorizontal + beatLength * (note.start - currentSection.start) + displacementX,
            regionPaddingTop + 10 + pitchStepHeight * (maxPitch - note.pitch + pitchPadding) + displacementY,
            beatLength * note.length,
            NOTE_HEIGHT,
            3,
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

        if (endBeat - startBeat >= 0.5)
            roundRect(
                ctx!,
                paddingHorizontal + beatLength * (playerNote.start - currentSection.start) + displacement2X,
                regionPaddingTop +
                    10 +
                    pitchStepHeight * (maxPitch - playerNote.note.pitch - playerNote.distance + pitchPadding) + displacement2Y,
                beatLength * (endBeat - startBeat),
                NOTE_HEIGHT,
                3,
                true,
                true,
            );
    });

    // debugPitches(ctx, drawingData);
}
