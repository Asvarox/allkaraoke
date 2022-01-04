import { calcDistance } from '../Helpers/calcDistance';
import { PitchRecord, RelativeLine, Song } from '../../../interfaces';
import roundRect from './roundRect';
import styles from './styles';
import isNotesSection from '../Helpers/isNotesSection';

const pitchPadding = 6;

function applyColor(ctx: CanvasRenderingContext2D, style: { fill: string, stroke: string, lineWidth: number }) {
    ctx.fillStyle = style.fill;
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.lineWidth;
}

function drawTimeIndicator(ctx: CanvasRenderingContext2D, data: DrawingData) {
    const { currentTime, canvas } = data;
    const { paddingHorizontal, maxTime, timeSectionGap } = calculateData(data);

    const relativeTime = Math.max(0, currentTime - timeSectionGap);

    ctx!.strokeStyle = 'black';
    const timeLineX = paddingHorizontal + (relativeTime / maxTime) * (canvas.width - (2 * paddingHorizontal));
    ctx!.beginPath();
    ctx!.moveTo(timeLineX, 0);
    ctx!.lineTo(timeLineX, canvas.height);
    ctx!.stroke();
}

function calculateData({ canvas, currentSectionIndex, song, songBeatLength, minPitch, maxPitch }: DrawingData) {
    const sections = song.tracks[0].sections;
    const currentSection = sections[currentSectionIndex];
    const nextSection = sections[currentSectionIndex + 1];

    
    const paddingHorizontal = Math.max(10 + canvas.width * .05);
    const lastNote = isNotesSection(currentSection) ? currentSection?.notes?.[currentSection.notes.length - 1] : undefined;
    const sectionEndBeat = isNotesSection(currentSection) ? (nextSection?.start ?? lastNote!.start + lastNote!.length) : currentSection.end;
    const timeSectionGap = currentSection.start * songBeatLength + song.gap;
    const maxTime = (sectionEndBeat - currentSection.start) * songBeatLength;

    const pitchStepHeight = (canvas.height * 0.5 - 20) / (maxPitch - minPitch + pitchPadding * 2);

    return {
        paddingHorizontal, currentSection, sectionEndBeat, timeSectionGap, maxTime, pitchStepHeight,
    }
}

interface DrawingData {
    song: Song,
    songBeatLength: number,
    minPitch: number,
    maxPitch: number,
    canvas: HTMLCanvasElement,
    currentTime: number,
    currentSectionIndex: number,
    pitches: [PitchRecord[], PitchRecord[]],
    lines: [RelativeLine[], RelativeLine[]],
}

export default function drawFrame(
    song: Song,
    songBeatLength: number,
    minPitch: number,
    maxPitch: number,
    canvas: HTMLCanvasElement,
    currentTime: number,
    currentSectionIndex: number,
    pitches: [PitchRecord[], PitchRecord[]],
    lines: [RelativeLine[], RelativeLine[]],
) {
    const drawingData = { 
        song, songBeatLength, minPitch, maxPitch, canvas, currentTime, currentSectionIndex, pitches, lines
    };

    const { sectionEndBeat, currentSection, paddingHorizontal, pitchStepHeight } = calculateData(drawingData)

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    

    drawTimeIndicator(ctx, drawingData);
    
    const beatLength = (canvas.width - (2 * paddingHorizontal)) / (sectionEndBeat - currentSection.start);

    isNotesSection(currentSection) && lines.forEach((playerLines, index) => {
        const regionPaddingTop = index * canvas.height * 0.5;

        currentSection.notes.forEach((note) => {
            if (note.type === 'star') {
                applyColor(ctx, styles.colors.lines.gold);
            } else {
                applyColor(ctx, styles.colors.lines.normal);
            }

            roundRect(ctx!,
                paddingHorizontal + beatLength * (note.start - currentSection.start),
                regionPaddingTop + 10 + pitchStepHeight * (maxPitch - note.pitch + pitchPadding),
                beatLength * note.length,
                20,
                3, true, true
            );
        });

        playerLines.forEach(playerNote => {
            if (playerNote.isPerfect && (playerNote.note.type === 'star')) {
                applyColor(ctx, styles.colors.players[index].goldPerfect);    
            } else if (playerNote.isPerfect) {
                applyColor(ctx, styles.colors.players[index].perfect);    
            } else if ((playerNote.note.type === 'star')) {
                applyColor(ctx, styles.colors.players[index].gold);    
            } else if (playerNote.distance === 0) {
                applyColor(ctx, styles.colors.players[index].hit);    
            } else {
                applyColor(ctx, styles.colors.players[index].miss);    
            }

            const startBeat = Math.max(playerNote.start, playerNote.note.start);
            const endBeat = Math.min(playerNote.start + playerNote.length, playerNote.note.start + playerNote.note.length);

            if (endBeat - startBeat >= .5)
            roundRect(ctx!,
                paddingHorizontal + beatLength * (playerNote.start - currentSection.start),
                regionPaddingTop + 10 + pitchStepHeight * (maxPitch - playerNote.note.pitch - playerNote.distance + pitchPadding),
                beatLength * (endBeat - startBeat),
                20,
                3, true, true
            );
        });

        // debugPitches(ctx, drawingData);
    });
}

function debugPitches(ctx: CanvasRenderingContext2D, data: DrawingData) {
    const { currentSection, paddingHorizontal, timeSectionGap, maxTime, pitchStepHeight } = calculateData(data);
    const { pitches, maxPitch, canvas, song, songBeatLength } = data;

    
    if (!isNotesSection(currentSection)) return;
    
    let previousNote: { pitch: number; lyrics: string } = currentSection.notes[0];
    
    ctx!.fillStyle = 'rgba(0, 0, 0, .5)';
    
    pitches.forEach((pitch, index) => pitch.forEach((entry: { pitch: number; timestamp: number }) => {
        const regionPaddingTop = index * canvas.height * 0.5;

        const currentBeat = Math.max(0, Math.floor((entry.timestamp - song.gap) / songBeatLength));
        const noteAtTheTime =
            currentSection.notes.find((note) => note.start <= currentBeat && note.start + note.length > currentBeat) ??
            previousNote;
        previousNote = noteAtTheTime;

        if (noteAtTheTime === undefined) return;

        const entryRelativeTime = Math.max(0, entry.timestamp - timeSectionGap);
        const entryX = paddingHorizontal + (entryRelativeTime / maxTime) * (canvas!.width - paddingHorizontal - paddingHorizontal);

        const toleratedDistance = calcDistance(entry.pitch, noteAtTheTime.pitch);
        const final = maxPitch - (noteAtTheTime.pitch + toleratedDistance) + pitchPadding;

        ctx?.fillRect(entryX, 10 + regionPaddingTop + final * pitchStepHeight, 10, 10);
    }));
}