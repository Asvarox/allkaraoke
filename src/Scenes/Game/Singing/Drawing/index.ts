import { PlayerNote } from '../../../../interfaces';
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

    private drawPlayer = (playerNumber: number, ctx: CanvasRenderingContext2D) => {
        const playerState = GameState.getPlayer(playerNumber);
        const regionPaddingTop = playerNumber * this.canvas.height * 0.5;
        const regionHeight = this.canvas.height * 0.5;
        const drawingData: DrawingData = {
            song: GameState.getSong()!,
            songBeatLength: GameState.getSongBeatLength(),
            minPitch: playerState.getMinPitch(),
            maxPitch: playerState.getMaxPitch(),
            canvas: this.canvas,
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

        const { currentSection } = calculateData(drawingData);
        if (!isNotesSection(currentSection)) return;

        const currentPlayerNotes = drawingData.playersNotes.filter((note) => note.note.start >= currentSection.start);

        const currentBeat = GameState.getCurrentBeat();

        const displacements: Record<number, [number, number]> = {};

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
                    (sungNote) =>
                        sungNote.note.start + sungNote.note.length + 30 >= currentBeat && sungNote.distance === 0,
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

            const { x, y, w, h } = this.getNoteCoords(playerNumber, note.start, note.length, note.pitch, true);

            roundRect(ctx!, x + displacementX, y + displacementY, w, h, 100, true, true);
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

            const [displacementX, displacementY] = (distance === 0 && displacements[playerNote.note.start]) || [0, 0];

            const { x, y, w, h } = this.getNoteCoords(
                playerNumber,
                playerNote.start,
                playerNote.length,
                playerNote.note.pitch - distance,
                distance === 0,
            );
            if (w > h / 2) {
                roundRect(ctx!, x + displacementX, y + displacementY, w, h, 100, true, true);

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

            const { x, y, w, h } = this.getNoteCoords(
                playerNumber,
                lastNote.start,
                lastNote.length,
                lastNote.note.pitch,
                true,
            );

            ParticleManager.add(
                new RayParticle(x + w + displacementX, y + h / 2 + displacementY, drawingData.currentTime, 1),
            );
        }

        false && debugPitches(ctx!, drawingData);
    };

    private explodeNotes = (player: number, previousSectionIndex: number) => {
        const section = GameState.getPlayer(player).getPreviousSection();
        if (!isNotesSection(section)) return;

        const playerNotes = GameState.getPlayer(player).getPlayerNotes();

        const notesToExplode = playerNotes.filter((note) => note.distance === 0 && section.notes.includes(note.note));

        notesToExplode.forEach((note) => {
            const { x, y, w, h } = this.getNoteCoords(
                player,
                note.start,
                note.length,
                note.note.pitch,
                true,
                previousSectionIndex,
            );
            ParticleManager.add(new ExplodingNoteParticle(x, y + h / 2, w, player, note.note, ParticleManager));
        });
    };

    private getNoteCoords = (
        playerNumber: number,
        start: number,
        length: number,
        pitch: number,
        big: boolean,
        sectionIndex?: number,
    ) => {
        const playerState = GameState.getPlayer(playerNumber);
        const regionPaddingTop = playerNumber * this.canvas.height * 0.5;
        const regionHeight = this.canvas.height * 0.5;

        const drawingData: DrawingData = {
            song: GameState.getSong()!,
            songBeatLength: GameState.getSongBeatLength(),
            minPitch: playerState.getMinPitch(),
            maxPitch: playerState.getMaxPitch(),
            canvas: this.canvas,
            currentTime: GameState.getCurrentTime(),
            currentSectionIndex: sectionIndex ?? playerState.getCurrentSectionIndex(),
            frequencies: playerState.getPlayerFrequencies(),
            playersNotes: playerState.getPlayerNotes(),
            playerNumber,
            track: playerState.getTrackIndex(),
            regionPaddingTop,
            regionHeight,
        };

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
