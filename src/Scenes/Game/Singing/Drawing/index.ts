import { calcDistance } from '../Helpers/calcDistance';
import { FrequencyRecord, PlayerNote, Song } from '../../../../interfaces';
import roundRect from './roundRect';
import styles from './styles';
import isNotesSection from '../Helpers/isNotesSection';

const pitchPadding = 6;

const NOTE_HEIGHT = 20;

function applyColor(ctx: CanvasRenderingContext2D, style: { fill: string; stroke: string; lineWidth: number }) {
    ctx.fillStyle = style.fill;
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.lineWidth;
}

function drawTimeIndicator(ctx: CanvasRenderingContext2D, data: DrawingData) {
    const { currentTime, canvas, regionPaddingTop, regionHeight } = data;
    const { paddingHorizontal, maxTime, timeSectionGap } = calculateData(data);

    const relativeTime = Math.max(0, currentTime - timeSectionGap);

    const timeLineX = paddingHorizontal + (relativeTime / maxTime) * (canvas.width - 2 * paddingHorizontal);
    ctx!.strokeStyle = 'rgba(0, 0, 0, .5)';
    ctx!.beginPath();
    ctx!.moveTo(timeLineX, regionPaddingTop);
    ctx!.lineTo(timeLineX, regionPaddingTop + regionHeight);
    ctx!.stroke();
    ctx!.strokeStyle = 'rgba(255, 255, 255, .5)';
    ctx!.beginPath();
    ctx!.moveTo(timeLineX - 1, regionPaddingTop);
    ctx!.lineTo(timeLineX - 1, regionPaddingTop + regionHeight);
    ctx!.stroke();
}

function calculateData({ canvas, currentSectionIndex, song, songBeatLength, minPitch, maxPitch, track }: DrawingData) {
    const sections = song.tracks[track].sections;
    const currentSection = sections[currentSectionIndex];
    const nextSection = sections[currentSectionIndex + 1];

    const paddingHorizontal = Math.max(10 + canvas.width * 0.05);
    const lastNote = isNotesSection(currentSection)
        ? currentSection?.notes?.[currentSection.notes.length - 1]
        : undefined;
    const sectionEndBeat = isNotesSection(currentSection)
        ? nextSection?.start ?? lastNote!.start + lastNote!.length
        : currentSection.end;
    const timeSectionGap = currentSection.start * songBeatLength + song.gap;
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

interface DrawingData {
    playerNumber: number,
    song: Song;
    songBeatLength: number;
    minPitch: number;
    maxPitch: number;
    canvas: HTMLCanvasElement;
    currentTime: number;
    currentSectionIndex: number;
    frequencies: FrequencyRecord[],
    playersNotes: PlayerNote[],
    track: number,
    regionPaddingTop: number,
    regionHeight: number,
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

    const drawingData = {
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

    currentSection.notes.forEach((note) => {
        if (note.type === 'star') {
            applyColor(ctx, styles.colors.lines.gold);
        } else {
            applyColor(ctx, styles.colors.lines.normal);
        }

        roundRect(
            ctx!,
            paddingHorizontal + beatLength * (note.start - currentSection.start),
            regionPaddingTop + 10 + pitchStepHeight * (maxPitch - note.pitch + pitchPadding),
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
                paddingHorizontal + beatLength * (playerNote.start - currentSection.start),
                regionPaddingTop +
                    10 +
                    pitchStepHeight * (maxPitch - playerNote.note.pitch - playerNote.distance + pitchPadding),
                beatLength * (endBeat - startBeat),
                NOTE_HEIGHT,
                3,
                true,
                true,
            );
    });

    // debugPitches(ctx, drawingData);
}

function debugPitches(ctx: CanvasRenderingContext2D, data: DrawingData) {
    const { currentSection, paddingHorizontal, timeSectionGap, maxTime, pitchStepHeight } = calculateData(data);
    const { frequencies, maxPitch, canvas, song, songBeatLength, playerNumber } = data;

    if (!isNotesSection(currentSection)) return;

    let previousNote: { pitch: number; lyrics: string } = currentSection.notes[0];

    ctx!.fillStyle = 'rgba(0, 0, 0, .5)';

    frequencies.forEach((entry) => {
        const regionPaddingTop = playerNumber * canvas.height * 0.5;

        const currentBeat = Math.max(0, Math.floor((entry.timestamp - song.gap) / songBeatLength));
        const noteAtTheTime =
            currentSection.notes.find(
                (note) => note.start <= currentBeat && note.start + note.length > currentBeat,
            ) ?? previousNote;
        previousNote = noteAtTheTime;

        if (noteAtTheTime === undefined) return;

        const entryRelativeTime = Math.max(0, entry.timestamp - timeSectionGap);
        const entryX =
            paddingHorizontal +
            (entryRelativeTime / maxTime) * (canvas!.width - paddingHorizontal - paddingHorizontal);

        const toleratedDistance = calcDistance(entry.frequency, noteAtTheTime.pitch);
        const final = maxPitch - (noteAtTheTime.pitch + toleratedDistance) + pitchPadding;

        ctx?.fillRect(entryX, 10 + regionPaddingTop + final * pitchStepHeight, 10, 10);
    });
}
