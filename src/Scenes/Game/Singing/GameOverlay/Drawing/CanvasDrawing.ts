import { noDistanceNoteTypes } from '../../../../../consts';
import { NotesSection, PlayerNote } from '../../../../../interfaces';
import GameState from '../../GameState/GameState';
import GameStateEvents from '../../GameState/GameStateEvents';
import getPlayerNoteDistance from '../../Helpers/getPlayerNoteDistance';
import isNotesSection from '../../Helpers/isNotesSection';
import calculateData, { DrawingData, NOTE_HEIGHT, pitchPadding } from './calculateData';
import debugPitches from './debugPitches';
import drawNote from './Elements/note';
import drawPlayerFrequencyTrace from './Elements/playerFrequencyTrace';
import drawPlayerNote from './Elements/playerNote';
import ParticleManager from './ParticleManager';
import ExplodingNoteParticle from './Particles/ExplodingNote';
import FadeoutNote from './Particles/FadeoutNote';
import RayParticle from './Particles/Ray';
import VibratoParticle from './Particles/Vibrato';

function getPlayerNoteAtBeat(playerNotes: PlayerNote[], beat: number) {
    return playerNotes.find((note) => note.start <= beat && note.start + note.length >= beat);
}

export default class CanvasDrawing {
    public constructor(private canvas: HTMLCanvasElement) {}
    public start = () => {
        GameStateEvents.sectionChange.subscribe(this.onSectionEnd);
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
        GameStateEvents.sectionChange.unsubscribe(this.onSectionEnd);
    };

    private drawPlayer = (playerNumber: number, ctx: CanvasRenderingContext2D) => {
        const drawingData = this.getDrawingData(playerNumber);
        const { currentSection } = calculateData(drawingData);
        if (!isNotesSection(currentSection)) return;

        const displacements = this.calculateDisplacements(currentSection, drawingData);

        this.drawNotesToSing(ctx, drawingData, displacements);
        this.drawSungNotes(ctx, drawingData, displacements);
        this.drawFlare(ctx, drawingData, displacements);

        false && debugPitches(ctx!, drawingData);
    };

    private drawNotesToSing = (
        ctx: CanvasRenderingContext2D,
        drawingData: DrawingData,
        displacements: Record<number, [number, number]>,
    ) => {
        if (!isNotesSection(drawingData.currentSection)) return;

        drawingData.currentSection.notes.forEach((note) => {
            const [displacementX, displacementY] = displacements[note.start];
            const { x, y, w, h } = this.getNoteCoords(drawingData, note.start, note.length, note.pitch, true);

            drawNote(ctx, x + displacementX, y + displacementY, w, h, note);
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
                drawPlayerNote(ctx, finalX, finalY, w, h, drawingData.playerNumber, distance === 0, playerNote);

                if (playerNote.vibrato) {
                    ParticleManager.add(new VibratoParticle(finalX, finalY, w, h, drawingData.currentTime));
                }

                if (
                    distance === 0 &&
                    playerNote.frequencyRecords.length > 3 &&
                    !noDistanceNoteTypes.includes(playerNote.note.type)
                ) {
                    drawPlayerFrequencyTrace(ctx, finalX, finalY, w, h, playerNote);
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

    private onSectionEnd = (playerNumber: number) => {
        const drawingData = this.getDrawingData(playerNumber, -1);
        if (!isNotesSection(drawingData.currentSection)) return;

        this.fadeoutNotes(drawingData.currentSection, drawingData);
        this.explodeNotes(drawingData.currentSection, drawingData);
    };

    private fadeoutNotes = (section: NotesSection, drawingData: DrawingData) => {
        section.notes.forEach((note) => {
            const { x, y, w, h } = this.getNoteCoords(drawingData, note.start, note.length, note.pitch, true);

            ParticleManager.add(new FadeoutNote(x, y, w, h, note));
        });
    };

    private explodeNotes = (section: NotesSection, drawingData: DrawingData) => {
        const notesToExplode = drawingData.playerNotes.filter(
            (note) =>
                (note.distance === 0 || noDistanceNoteTypes.includes(note.note.type)) &&
                section.notes.includes(note.note),
        );

        notesToExplode.forEach((note) => {
            const { x, y, w, h } = this.getNoteCoords(drawingData, note.start, note.length, note.note.pitch, true);
            ParticleManager.add(
                new ExplodingNoteParticle(x, y + h / 2, w, drawingData.playerNumber, note.note, ParticleManager),
            );
        });
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

    private getPreciseY = (y: number, h: number, preciseDistance: number) => y + h / 2 - (preciseDistance * h) / 3;
}
