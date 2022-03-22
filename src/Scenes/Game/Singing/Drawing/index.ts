import { noDistanceNoteTypes } from '../../../../consts';
import { NotesSection, PlayerNote } from '../../../../interfaces';
import GameState from '../GameState/GameState';
import GameStateEvents from '../GameState/GameStateEvents';
import getPlayerNoteDistance from '../Helpers/getPlayerNoteDistance';
import isNotesSection from '../Helpers/isNotesSection';
import calculateData, { DrawingData, NOTE_HEIGHT, pitchPadding } from './calculateData';
import debugPitches from './debugPitches';
import ParticleManager from './ParticleManager';
import ExplodingNoteParticle from './Particles/ExplodingNote';
import RayParticle from './Particles/Ray';
import VibratoParticle from './Particles/Vibrato';
import roundRect from './roundRect';
import styles from './styles';

function applyColor(ctx: CanvasRenderingContext2D, style: { fill: string; stroke: string; lineWidth: number }) {
    ctx.fillStyle = style.fill;
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.lineWidth;
}

function getPlayerNoteAtBeat(playerNotes: PlayerNote[], beat: number) {
    return playerNotes.find((note) => note.start <= beat && note.start + note.length >= beat);
}

export default class CanvasDrawing {
    public constructor(private canvas: HTMLCanvasElement) {}
    public start = () => {
        GameStateEvents.sectionChange.subscribe(this.explodeNotes);
    };

    public drawFrame = () => {
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < GameState.getPlayerCount(); i++) {
            this.drawPlayer(i, ctx);
        }

        ParticleManager.tick(ctx, this.canvas);
    };

    public end = () => {
        GameStateEvents.sectionChange.unsubscribe(this.explodeNotes);
    };

    private calculateDisplacements = (currentSection: NotesSection, drawingData: DrawingData) => {
        const displacements: Record<number, [number, number]> = {};

        currentSection.notes.forEach((note) => {
            const sungNotesStreak = drawingData.playerNotes
                .filter((sungNote) => sungNote.note.start === note.start)
                .filter(
                    (sungNote) =>
                        sungNote.note.start + sungNote.note.length + 30 >= drawingData.currentBeat &&
                        sungNote.distance === 0,
                )
                .map((sungNote) =>
                    sungNote.start + 30 < drawingData.currentBeat
                        ? sungNote.length - (drawingData.currentBeat - 30 - sungNote.start)
                        : sungNote.length,
                )
                .reduce((currLength, sungNoteLength) => Math.min(currLength + sungNoteLength, 30), 0);

            const displacementRange = Math.max(0, (sungNotesStreak - 5) / (note.type === 'star' ? 3 : 5));
            const displacementX = (Math.random() - 0.5) * displacementRange;
            const displacementY = (Math.random() - 0.5) * displacementRange;

            displacements[note.start] = [displacementX, displacementY];
        });

        return displacements;
    };

    private getDrawingData = (playerNumber: number, sectionShift = 0): DrawingData => {
        const playerState = GameState.getPlayer(playerNumber);
        const currentSectionIndex = playerState.getCurrentSectionIndex() + sectionShift ?? 0;
        const song = GameState.getSong()!;
        const track = playerState.getTrackIndex();
        const currentSection = song.tracks[track].sections[currentSectionIndex];
        const playerNotes = playerState.getPlayerNotes();

        return {
            song,
            songBeatLength: GameState.getSongBeatLength(),
            minPitch: playerState.getMinPitch(),
            maxPitch: playerState.getMaxPitch(),
            canvas: this.canvas,
            currentTime: GameState.getCurrentTime(),
            frequencies: playerState.getPlayerFrequencies(),
            playerNotes,
            currentPlayerNotes: playerNotes.filter((note) => note.note.start >= currentSection.start),
            playerNumber,
            track: playerState.getTrackIndex(),
            regionPaddingTop: playerNumber * this.canvas.height * 0.5,
            regionHeight: this.canvas.height * 0.5,
            currentBeat: GameState.getCurrentBeat(),
            currentSectionIndex,
            currentSection,
        };
    };

    private drawNotesToSing = (
        ctx: CanvasRenderingContext2D,
        drawingData: DrawingData,
        displacements: Record<number, [number, number]>,
    ) => {
        if (!isNotesSection(drawingData.currentSection)) return;

        drawingData.currentSection.notes.forEach((note) => {
            if (note.type === 'star') {
                applyColor(ctx, styles.colors.lines.star);
            } else if (note.type === 'freestyle' || note.type === 'rap') {
                applyColor(ctx, styles.colors.lines.freestyle);
            } else {
                applyColor(ctx, styles.colors.lines.normal);
            }

            const [displacementX, displacementY] = displacements[note.start];

            const { x, y, w, h } = this.getNoteCoords(drawingData, note.start, note.length, note.pitch, true);

            roundRect(ctx!, x + displacementX, y + displacementY, w, h, 100, true, true);
        });
    };

    private drawSungNotes = (
        ctx: CanvasRenderingContext2D,
        drawingData: DrawingData,
        displacements: Record<number, [number, number]>,
    ) => {
        if (!isNotesSection(drawingData.currentSection)) return;

        drawingData.currentPlayerNotes.forEach((playerNote) => {
            const distance = getPlayerNoteDistance(playerNote);

            if (playerNote.isPerfect && playerNote.note.type === 'star') {
                applyColor(ctx, styles.colors.players[drawingData.playerNumber].starPerfect);
            } else if (playerNote.isPerfect) {
                applyColor(ctx, styles.colors.players[drawingData.playerNumber].perfect);
            } else if (playerNote.note.type === 'star' && distance === 0) {
                applyColor(ctx, styles.colors.players[drawingData.playerNumber].star);
            } else if (distance === 0) {
                applyColor(ctx, styles.colors.players[drawingData.playerNumber].hit);
            } else {
                applyColor(ctx, styles.colors.players[drawingData.playerNumber].miss);
            }

            const [displacementX, displacementY] = (distance === 0 && displacements[playerNote.note.start]) || [0, 0];

            const { x, y, w, h } = this.getNoteCoords(
                drawingData,
                playerNote.start,
                playerNote.length,
                playerNote.note.pitch + distance,
                distance === 0,
            );
            if (w > h / 2) {
                const finalX = x + displacementX;
                const finalY = y + displacementY;
                roundRect(ctx!, finalX, finalY, w, h, 100, true, true);

                if (playerNote.vibrato) {
                    ParticleManager.add(new VibratoParticle(finalX, finalY, w, h, drawingData.currentTime));
                }

                if (
                    distance === 0 &&
                    playerNote.frequencyRecords.length > 3 &&
                    !noDistanceNoteTypes.includes(playerNote.note.type)
                ) {
                    ctx.save();
                    roundRect(ctx, finalX, finalY, w, h, 100, false, false);
                    ctx.clip();

                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255,255,255, .35)';
                    ctx.lineWidth = 3;
                    ctx.moveTo(finalX, finalY + h / 2 - (playerNote.frequencyRecords[0].preciseDistance * h) / 3);
                    for (let i = 1; i < playerNote.frequencyRecords.length; i++) {
                        ctx.lineTo(
                            finalX + i * (w / (playerNote.frequencyRecords.length - 1)),
                            finalY + h / 2 - (playerNote.frequencyRecords[i].preciseDistance * h) / 3,
                        );
                    }
                    ctx.stroke();
                    ctx.closePath();

                    ctx.restore();
                }
            }
        });
    };

    private drawFlare = (
        ctx: CanvasRenderingContext2D,
        drawingData: DrawingData,
        displacements: Record<number, [number, number]>,
    ) => {
        if (!isNotesSection(drawingData.currentSection)) return;

        const lastNote = getPlayerNoteAtBeat(
            drawingData.currentPlayerNotes,
            drawingData.currentBeat - 185 / drawingData.songBeatLength,
        );

        if (lastNote && lastNote.distance === 0) {
            const [displacementX, displacementY] = displacements[lastNote.note.start] || [0, 0];

            const { x, y, w, h } = this.getNoteCoords(
                drawingData,
                lastNote.start,
                lastNote.length,
                lastNote.note.pitch,
                true,
            );
            const preciseDistance = noDistanceNoteTypes.includes(lastNote.note.type)
                ? 0
                : lastNote.frequencyRecords.at(-1)!.preciseDistance;

            const finalX = x + displacementX + w;
            const finalY = this.getPreciseY(y + displacementY, h, preciseDistance);

            ParticleManager.add(new RayParticle(finalX, finalY, drawingData.currentTime, 1));
        }
    };

    private drawPlayer = (playerNumber: number, ctx: CanvasRenderingContext2D) => {
        const drawingData = this.getDrawingData(playerNumber);

        if (drawingData.currentSectionIndex < 0) {
            console.error(`currentSection is negative`, playerNumber, drawingData.track, drawingData.currentTime);
            return;
        }

        const { currentSection } = calculateData(drawingData);
        if (!isNotesSection(currentSection)) return;

        const displacements = this.calculateDisplacements(currentSection, drawingData);

        this.drawNotesToSing(ctx, drawingData, displacements);
        this.drawSungNotes(ctx, drawingData, displacements);
        this.drawFlare(ctx, drawingData, displacements);

        false && debugPitches(ctx!, drawingData);
    };

    private getPreciseY = (y: number, h: number, preciseDistance: number) => y + h / 2 - (preciseDistance * h) / 3;

    private explodeNotes = (playerNumber: number) => {
        const section = GameState.getPlayer(playerNumber).getPreviousSection();
        if (!isNotesSection(section)) return;
        const drawingData = this.getDrawingData(playerNumber, -1);

        const notesToExplode = drawingData.playerNotes.filter(
            (note) =>
                (note.distance === 0 || noDistanceNoteTypes.includes(note.note.type)) &&
                section.notes.includes(note.note),
        );

        notesToExplode.forEach((note) => {
            const { x, y, w, h } = this.getNoteCoords(drawingData, note.start, note.length, note.note.pitch, true);
            ParticleManager.add(new ExplodingNoteParticle(x, y + h / 2, w, playerNumber, note.note, ParticleManager));
        });
    };

    private getNoteCoords = (drawingData: DrawingData, start: number, length: number, pitch: number, big: boolean) => {
        const regionPaddingTop = drawingData.playerNumber * this.canvas.height * 0.5;

        const { sectionEndBeat, currentSection, paddingHorizontal, pitchStepHeight } = calculateData(drawingData);
        const sectionStart = isNotesSection(currentSection) ? currentSection.notes[0].start : 1;

        const beatLength = (this.canvas.width - 2 * paddingHorizontal) / (sectionEndBeat - sectionStart);

        return {
            x: paddingHorizontal + beatLength * (start - sectionStart),
            y: regionPaddingTop + 10 + pitchStepHeight * (drawingData.maxPitch - pitch + pitchPadding) - (big ? 3 : 0),
            w: beatLength * length,
            h: NOTE_HEIGHT + (big ? 6 : 0),
        };
    };
}
