import { calcDistance } from '../Helpers/calcDistance';
import { PitchRecord, RelativeLine, Song } from '../../../interfaces';
import roundRect from './roundRect';
import styles from './styles';

const pitchPadding = 6;

function applyColor(ctx: CanvasRenderingContext2D, style: { fill: string, stroke: string }) {
    ctx.fillStyle = style.fill;
    ctx.strokeStyle = style.stroke;
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

function calculateData({ canvas, currentSection, song, songBeatLength }: DrawingData) {
    const paddingHorizontal = Math.max(10 + canvas.width * .05);
    const section = song.sections[currentSection];
    const lastNote = section.notes[section.notes.length - 1];
    const sectionEndBeat = song.sections?.[currentSection + 1]?.start ?? lastNote.start + lastNote.length;
    const timeSectionGap = section.start * songBeatLength + song.gap;
    const maxTime = (sectionEndBeat - section.start) * songBeatLength;

    return {
        paddingHorizontal, section, lastNote, sectionEndBeat, timeSectionGap, maxTime,
    }
}

interface DrawingData {
    song: Song,
    songBeatLength: number,
    minPitch: number,
    maxPitch: number,
    canvas: HTMLCanvasElement,
    currentTime: number,
    currentSection: number,
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
    currentSection: number,
    pitches: [PitchRecord[], PitchRecord[]],
    lines: [RelativeLine[], RelativeLine[]],
) {
    const drawingData = { 
        song, songBeatLength, minPitch, maxPitch, canvas, currentTime, currentSection, pitches, lines
    };

    const { sectionEndBeat, section, paddingHorizontal, timeSectionGap, maxTime } = calculateData(drawingData)

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    

    drawTimeIndicator(ctx, drawingData);
    
    const beatLength = (canvas.width - (2 * paddingHorizontal)) / (sectionEndBeat - section.start);
    const pitchStepHeight = (canvas.height * 0.5 - 20) / (maxPitch - minPitch + pitchPadding * 2);

    lines.forEach((playerLines, index) => {
        const regionPaddingTop = index * canvas.height * 0.5;

        applyColor(ctx, styles.colors.lines);
        section.notes.forEach((note) => {
            ctx!.fillStyle = 'grey';
            ctx!.strokeStyle = 'black';

            roundRect(ctx!,
                paddingHorizontal + beatLength * (note.start - section.start),
                regionPaddingTop + 10 + pitchStepHeight * (maxPitch - note.pitch + pitchPadding),
                beatLength * note.length,
                20,
                3, true, true
            );
        });

        playerLines.forEach(playerNote => {
            applyColor(ctx, playerNote.distance === 0 ? styles.colors.players[index].hit : styles.colors.players[index].miss);

            const startBeat = Math.max(playerNote.start, playerNote.note.start);
            const endBeat = Math.min(playerNote.start + playerNote.length, playerNote.note.start + playerNote.note.length);

            if (endBeat - startBeat >= .5)
            roundRect(ctx!,
                paddingHorizontal + beatLength * (playerNote.start - section.start),
                regionPaddingTop + 10 + pitchStepHeight * (maxPitch - playerNote.note.pitch - playerNote.distance + pitchPadding),
                beatLength * (endBeat - startBeat),
                20,
                3, true, true
            );
        })

        let previousNote: { pitch: number; lyrics: string } = section.notes[0];

        ctx!.fillStyle = 'rgba(0, 0, 0, .5)';

        pitches[index].forEach((entry: { pitch: number; timestamp: number }) => {
            const currentBeat = Math.max(0, Math.floor((entry.timestamp - song.gap) / songBeatLength));
            const noteAtTheTime =
                section.notes.find((note) => note.start <= currentBeat && note.start + note.length > currentBeat) ??
                previousNote;
            previousNote = noteAtTheTime;

            if (noteAtTheTime === undefined) return;

            const entryRelativeTime = Math.max(0, entry.timestamp - timeSectionGap);
            const entryX = paddingHorizontal + (entryRelativeTime / maxTime) * (canvas!.width - paddingHorizontal - paddingHorizontal);

            const toleratedDistance = calcDistance(entry.pitch, noteAtTheTime.pitch);
            const final = maxPitch - (noteAtTheTime.pitch + toleratedDistance) + pitchPadding;

            ctx?.fillRect(entryX, 10 + regionPaddingTop + final * pitchStepHeight, 10, 10);
        });
    });
}
