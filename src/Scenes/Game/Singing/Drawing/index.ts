import { PlayerNote } from '../../../../interfaces';
import GameState from '../GameState/GameState';
import getPlayerNoteDistance from '../Helpers/getPlayerNoteDistance';
import isNotesSection from '../Helpers/isNotesSection';
import calculateData, { DrawingData, NOTE_HEIGHT, pitchPadding } from './calculateData';
import debugPitches from './debugPitches';
import ParticleManager from './ParticleManager';
import RayParticle from './Particles/Ray';
import VibratoParticle from './Particles/Vibrato';
import roundRect from './roundRect';
import styles from './styles';

function applyColor(ctx: CanvasRenderingContext2D, style: { fill: string; stroke: string; lineWidth: number }) {
    ctx.fillStyle = style.fill;
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.lineWidth;
}

export default function drawFrame(playerNumber: number, canvas: HTMLCanvasElement) {
    const playerState = GameState.getPlayer(playerNumber);
    const regionPaddingTop = playerNumber * canvas.height * 0.5;
    const regionHeight = canvas.height * 0.5;
    const drawingData: DrawingData = {
        song: GameState.getSong()!,
        songBeatLength: GameState.getSongBeatLength(),
        minPitch: playerState.getMinPitch(),
        maxPitch: playerState.getMaxPitch(),
        canvas,
        currentTime: GameState.getCurrentTime(),
        currentSectionIndex: playerState.getCurrentSectionIndex(),
        frequencies: playerState.getPlayerFrequencies(),
        playersNotes: playerState.getPlayerNotes(),
        playerNumber,
        track: playerState.getTrackIndex(),
        regionPaddingTop,
        regionHeight,
    };

    if (drawingData.currentSectionIndex < 0) {
        console.error(`currentSection is negative`, playerNumber, drawingData.track, drawingData.currentTime);
        return;
    }

    const { sectionEndBeat, currentSection, paddingHorizontal, pitchStepHeight } = calculateData(drawingData);

    const currentPlayerNotes = drawingData.playersNotes.filter((note) => note.note.start >= currentSection.start);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // drawTimeIndicator(ctx, drawingData);

    const beatLength = (canvas.width - 2 * paddingHorizontal) / (sectionEndBeat - currentSection.start);

    if (!isNotesSection(currentSection)) {
        ParticleManager.tick(ctx, canvas);
        return;
    }

    const currentBeat = GameState.getCurrentBeat();

    const displacements: Record<number, [number, number]> = {};

    const getNoteCoords = (start: number, length: number, pitch: number, big: boolean) => ({
        x: paddingHorizontal + beatLength * (start - currentSection.start),
        y: regionPaddingTop + 10 + pitchStepHeight * (drawingData.maxPitch - pitch + pitchPadding) - (big ? 3 : 0),
        w: beatLength * length,
        h: NOTE_HEIGHT + (big ? 3 : 0),
    });

    currentSection.notes.forEach((note) => {
        if (note.type === 'star') {
            applyColor(ctx, styles.colors.lines.star);
        } else if (note.type === 'freestyle' || note.type === 'rap') {
            applyColor(ctx, styles.colors.lines.freestyle);
        } else {
            applyColor(ctx, styles.colors.lines.normal);
        }

        const sungNotesStreak = drawingData.playersNotes
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

        const { x, y, w, h } = getNoteCoords(note.start, note.length, note.pitch, true);

        roundRect(ctx!, x + displacementX, y + displacementY, w, h, 5, true, true);
    });

    currentPlayerNotes.forEach((playerNote) => {
        const distance = getPlayerNoteDistance(playerNote);

        if (playerNote.isPerfect && playerNote.note.type === 'star') {
            applyColor(ctx, styles.colors.players[playerNumber].starPerfect);
        } else if (playerNote.isPerfect) {
            applyColor(ctx, styles.colors.players[playerNumber].perfect);
        } else if (playerNote.note.type === 'star' && distance === 0) {
            applyColor(ctx, styles.colors.players[playerNumber].star);
        } else if (distance === 0) {
            applyColor(ctx, styles.colors.players[playerNumber].hit);
        } else {
            applyColor(ctx, styles.colors.players[playerNumber].miss);
        }

        const startBeat = playerNote.start;
        const endBeat = playerNote.start + playerNote.length;

        const [displacementX, displacementY] = (distance === 0 && displacements[playerNote.note.start]) || [0, 0];

        if (endBeat - startBeat >= 0.5) {
            const { x, y, w, h } = getNoteCoords(
                playerNote.start,
                playerNote.length,
                playerNote.note.pitch - distance,
                distance === 0,
            );
            roundRect(ctx!, x + displacementX, y + displacementY, w, h, 5, true, true);

            if (playerNote.vibrato) {
                ParticleManager.add(
                    new VibratoParticle(x + displacementX, y + displacementY, w, h, drawingData.currentTime),
                );
            }
        }
    });

    const lastNote = getPlayerNoteAtBeat(currentPlayerNotes, currentBeat - 185 / drawingData.songBeatLength);

    if (lastNote && lastNote.distance === 0) {
        const [displacementX, displacementY] = displacements[lastNote.note.start] || [0, 0];

        // const streak = takeRightWhile(
        //     playersNotes,
        //     (note) => note.start + note.length + 30 > currentBeat && getPlayerNoteDistance(note) === 0,
        // ).reduce((sum, note) => sum + note.length, 0);

        const { x, y, w, h } = getNoteCoords(lastNote.start, lastNote.length, lastNote.note.pitch, true);

        ParticleManager.add(
            new RayParticle(x + w + displacementX, y + h / 2 + displacementY, drawingData.currentTime, 1),
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

    false && debugPitches(ctx!, drawingData);
}

function getPlayerNoteAtBeat(playerNotes: PlayerNote[], beat: number) {
    return playerNotes.find((note) => note.start <= beat && note.start + note.length >= beat);
}
