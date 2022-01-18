import { takeRightWhile } from 'lodash';
import { FrequencyRecord, PlayerNote, Song } from '../../../../interfaces';
import getCurrentBeat from '../Helpers/getCurrentBeat';
import getPlayerNoteDistance from '../Helpers/getPlayerNoteDistance';
import isNotesSection from '../Helpers/isNotesSection';
import calculateData, { DrawingData, NOTE_HEIGHT, pitchPadding } from './calculateData';
import debugPitches from './debugPitches';
import ParticleManager from './ParticleManager';
import RayParticle from './Particles/Ray';
import roundRect from './roundRect';
import styles from './styles';

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

    // drawTimeIndicator(ctx, drawingData);

    const beatLength = (canvas.width - 2 * paddingHorizontal) / (sectionEndBeat - currentSection.start);

    if (!isNotesSection(currentSection)) {
        ParticleManager.tick(ctx, canvas);
        return;
    }

    const currentBeat = getCurrentBeat(currentTime, songBeatLength, song.gap, false);

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
        const distance = getPlayerNoteDistance(playerNote);

        if (playerNote.isPerfect && playerNote.note.type === 'star') {
            applyColor(ctx, styles.colors.players[playerNumber].goldPerfect);
        } else if (playerNote.isPerfect) {
            applyColor(ctx, styles.colors.players[playerNumber].perfect);
        } else if (playerNote.note.type === 'star' && distance === 0) {
            applyColor(ctx, styles.colors.players[playerNumber].gold);
        } else if (distance === 0) {
            applyColor(ctx, styles.colors.players[playerNumber].hit);
        } else {
            applyColor(ctx, styles.colors.players[playerNumber].miss);
        }

        const startBeat = playerNote.start;
        const endBeat = playerNote.start + playerNote.length;

        const [displacementX, displacementY] = (distance === 0 && displacements[playerNote.note.start]) || [0, 0];

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

    const lastNote = getPlayerNoteAtBeat(playersNotes, currentBeat - 155 / songBeatLength);

    if (lastNote && lastNote.distance === 0) {
        const [displacementX, displacementY] = displacements[lastNote.note.start] || [0, 0];

        const streak = takeRightWhile(
            playersNotes,
            (note) => note.start + note.length + 30 > currentBeat && getPlayerNoteDistance(note) === 0,
        ).reduce((sum, note) => sum + note.length, 0);

        ParticleManager.add(
            new RayParticle(
                paddingHorizontal +
                    beatLength * (lastNote.start + lastNote.length - currentSection.start) +
                    displacementX,
                regionPaddingTop +
                    10 +
                    pitchStepHeight * (maxPitch - lastNote.note.pitch + pitchPadding) +
                    displacementY -
                    3 +
                    12,
                currentTime,
                streak / 3,
            ),
        );
    }

    // ParticleManager.add(
    //     new RayParticle(
    //         paddingHorizontal + beatLength * (currentBeat - currentSection.start),
    //         regionPaddingTop + canvas.height / 2 - 50,
    //         currentTime,
    //     ),
    // );

    ParticleManager.tick(ctx, canvas);

    debugPitches(ctx, drawingData);
}

function getPlayerNoteAtBeat(playerNotes: PlayerNote[], beat: number) {
    return playerNotes.find((note) => note.start <= beat && note.start + note.length >= beat);
}
