import { captureException } from '@sentry/react';
import events from 'GameEvents/GameEvents';
import PlayersManager from 'Players/PlayersManager';
import { drawPlayerCanvas } from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/debugPlayerCanvas';
import getNoteColor from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/utils/getNoteColor';
import SungTriangle from 'Scenes/Game/Singing/GameOverlay/Drawing/Particles/SungTriangle';
import { Shaders } from 'Scenes/Game/Singing/GameOverlay/Drawing/Shaders/Shaders';
import { FPSCountSetting, GraphicSetting } from 'Scenes/Settings/SettingsState';
import isNotesSection from 'Songs/utils/isNotesSection';
import { noDistanceNoteTypes } from 'consts';
import { Note, NotesSection, PlayerNote } from 'interfaces';
import { randomFloat } from 'utils/randomValue';
import GameState from '../../GameState/GameState';
import getPlayerNoteDistance from '../../Helpers/getPlayerNoteDistance';
import debugPitches from './Elements/debugPitches';
import drawNote from './Elements/note';
import drawPlayerFrequencyTrace from './Elements/playerFrequencyTrace';
import drawPlayerNote from './Elements/playerNote';
import ParticleManager from './ParticleManager';
import ExplodingNoteParticle from './Particles/ExplodingNote';
import FadeoutNote from './Particles/FadeoutNote';
import RayParticle from './Particles/Ray';
import VibratoParticle from './Particles/Vibrato';
import calculateData, { BIG_NOTE_HEIGHT, DrawingData, NOTE_HEIGHT, pitchPadding } from './calculateData';

const MAX_LOOKUP_RANGE = 20;
function getPlayerNoteAtBeat(playerNotes: PlayerNote[], beat: number) {
  return playerNotes.find((note) => note.start <= beat && note.start + note.length >= beat);
}

export default class CanvasDrawing {
  private loop = false;
  private pauseTime = 0;
  private pausedOn = 0;

  public constructor(
    private canvas: HTMLCanvasElement,
    private verticalMargin: number = 0,
    private scaleFactor: number = 1,
  ) {}

  private shaders: Shaders | null = null;
  public start = () => {
    events.sectionChange.subscribe(this.onSectionEnd);
    this.loop = true;

    this.drawFrame();

    if (false && GraphicSetting.get() === 'high') {
      try {
        this.shaders = new Shaders(this.canvas);
      } catch (e) {
        captureException(e);
      }
    }
  };

  public pause = () => {
    this.end();
    this.pausedOn = Date.now();
  };

  public resume = () => {
    this.pauseTime += Date.now() - this.pausedOn;
    this.start();
  };

  public end = () => {
    this.loop = false;

    this.shaders?.cleanup();
    events.sectionChange.unsubscribe(this.onSectionEnd);
  };

  public isPlaying = () => this.loop;

  public drawFrame = () => {
    const startTime = Date.now();
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    if (GameState.isPlaying()) {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const players = PlayersManager.getPlayers();
      players.forEach((player, index) => {
        this.drawPlayer(player.number, ctx);
      });

      ParticleManager.tick(ctx, this.canvas, this.pauseTime);
    }

    if (FPSCountSetting.get() === 30) {
      const endTime = Date.now();
      const baseTimeout = 1000 / 30;
      const finalTimeout = endTime - startTime > baseTimeout ? baseTimeout : baseTimeout - (endTime - startTime);
      if (this.loop) setTimeout(this.drawFrame, finalTimeout, FPSCountSetting.get());
    }
    if (FPSCountSetting.get() !== 30) {
      if (this.loop) window.requestAnimationFrame(this.drawFrame);
    }
  };

  private drawPlayer = (playerNumber: 0 | 1 | 2 | 3, ctx: CanvasRenderingContext2D) => {
    const drawingData = this.getDrawingData(playerNumber);
    const { currentSection } = calculateData(drawingData);

    if (GraphicSetting.get() === 'high') {
      this.setDistortionForce(drawingData);
    }

    if (!isNotesSection(currentSection)) return;

    const displacements = this.calculateDisplacements(currentSection, drawingData);

    this.drawNotesToSing(ctx, drawingData, displacements);
    this.drawSungNotes(ctx, drawingData, displacements);

    if (GraphicSetting.get() === 'high') {
      this.drawFlare(ctx, drawingData, displacements);
    }
    false && drawPlayerCanvas(drawingData);
    false && debugPitches(ctx!, drawingData);
  };

  private setDistortionForce = (drawingData: DrawingData) => {
    const currentSection = drawingData.currentSection;

    if (!isNotesSection(currentSection)) {
      this.shaders?.updatePlayerForce(
        drawingData.playerNumber,
        (this.shaders?.getPlayerForce(drawingData.playerNumber) ?? 0) * 0.99,
      );
    } else {
      const max = Math.max(0, drawingData.currentBeat - MAX_LOOKUP_RANGE);

      const sungNotes = drawingData.currentPlayerNotes
        .filter((note) => note.note.start + note.note.length >= max)
        .filter((note) => getPlayerNoteDistance(note) === 0)
        .reduce((curr, note) => curr + note.length - Math.max(0, max - note.start), 0);

      const lastPlayerNote = drawingData.currentPlayerNotes.at(-1);
      const lastPlayerNoteEnd = (lastPlayerNote?.start ?? 0) + (lastPlayerNote?.length ?? 0);
      const beatsSinceLastHit = drawingData.currentBeat - lastPlayerNoteEnd;

      const forcePercent = Math.max(
        Math.min(Math.pow((sungNotes - beatsSinceLastHit / 1.5) / MAX_LOOKUP_RANGE, 3), 0.98),
        0,
      );
      this.shaders?.updatePlayerForce(drawingData.playerNumber, forcePercent);
    }
  };

  private drawNotesToSing = (
    ctx: CanvasRenderingContext2D,
    drawingData: DrawingData,
    displacements: Record<number, [number, number]>,
  ) => {
    if (!isNotesSection(drawingData.currentSection)) return;

    drawingData.currentSection.notes.forEach((note) => {
      const { x, y, w, h } = this.getNoteCoords(drawingData, note, note.pitch, true, displacements[note.start]);

      drawNote(ctx, x, y, w, note, drawingData.playerNumber);
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

      const { x, y, w, h } = this.getNoteCoords(
        drawingData,
        playerNote,
        playerNote.note.pitch + distance,
        distance === 0,
        displacements[playerNote.note.start],
      );
      if (distance > 0 || w > h / 2.5) {
        drawPlayerNote(ctx, x, y, w, drawingData.playerNumber, distance === 0, playerNote);

        if (playerNote.vibrato) {
          ParticleManager.add(new VibratoParticle(x, y, w, h, drawingData.currentTime));
        }

        if (
          distance === 0 &&
          playerNote.frequencyRecords.length > 3 &&
          !noDistanceNoteTypes.includes(playerNote.note.type)
        ) {
          drawPlayerFrequencyTrace(ctx, x, y, w, h, playerNote);
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
      const displacement = displacements[lastNote.note.start] || [0, 0];

      const { x, y, w, h } = this.getNoteCoords(drawingData, lastNote, lastNote.note.pitch, true, displacement);
      const preciseDistance = noDistanceNoteTypes.includes(lastNote.note.type)
        ? 0
        : lastNote.frequencyRecords.at(-1)!.preciseDistance;

      const finalX = x + w;
      const finalY = this.getPreciseY(y, h, preciseDistance);

      ParticleManager.add(new RayParticle(finalX, finalY, drawingData.currentTime, 1));

      ParticleManager.add(
        new SungTriangle(
          randomFloat(Math.max(x, finalX - 50), finalX),
          finalY,
          getNoteColor(ctx, drawingData.playerNumber, true, lastNote).fill,
        ),
      );

      this.shaders?.updatePlayerCenter(drawingData.playerNumber, finalX, finalY);
    }
  };

  private onSectionEnd = (playerNumber: 0 | 1 | 2 | 3) => {
    if (GameState.isPlaying()) {
      const drawingData = this.getDrawingData(playerNumber, -1);
      if (!isNotesSection(drawingData.currentSection)) return;

      this.fadeoutNotes(drawingData.currentSection, drawingData);
      this.explodeNotes(drawingData.currentSection, drawingData);
    }
  };

  private fadeoutNotes = (section: NotesSection, drawingData: DrawingData) => {
    if (GraphicSetting.get() === 'high') {
      section.notes.forEach((note) => {
        const { x, y, w, h } = this.getNoteCoords(drawingData, note, note.pitch, true);

        ParticleManager.add(new FadeoutNote(x, y, w, note, drawingData.playerNumber));
      });
    }
  };

  private explodeNotes = (section: NotesSection, drawingData: DrawingData) => {
    if (GraphicSetting.get() === 'high') {
      const notesToExplode = drawingData.playerNotes.filter(
        (note) =>
          (note.distance === 0 || noDistanceNoteTypes.includes(note.note.type)) && section.notes.includes(note.note),
      );

      notesToExplode.forEach((note) => {
        const { x, y, w, h } = this.getNoteCoords(drawingData, note, note.note.pitch, true);
        ParticleManager.add(
          new ExplodingNoteParticle(x, y + h / 2, w, drawingData.playerNumber, note.note, ParticleManager),
        );
      });
    }
  };

  private calculateDisplacements = (currentSection: NotesSection, drawingData: DrawingData) => {
    const displacements: Record<number, [number, number]> = {};

    if (GraphicSetting.get() === 'high') {
      currentSection.notes.forEach((note) => {
        const sungNotesStreak = drawingData.playerNotes
          .filter((sungNote) => sungNote.note.start === note.start)
          .filter(
            (sungNote) =>
              sungNote.note.start + sungNote.note.length + 30 >= drawingData.currentBeat && sungNote.distance === 0,
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
    } else {
      currentSection.notes.forEach((note) => {
        displacements[note.start] = [0, 0];
      });
    }

    return displacements;
  };

  private getDrawingData = (playerNumber: 0 | 1 | 2 | 3, sectionShift = 0): DrawingData => {
    const players = PlayersManager.getPlayers();
    const playerIndex = players.findIndex((player) => player.number === playerNumber);
    const playerCount = players.length;

    const playerState = GameState.getPlayer(playerNumber)!;
    const currentSectionIndex = playerState.getCurrentSectionIndex() + sectionShift;
    const song = GameState.getSong()!;
    const track = playerState.getTrack();
    const currentSection = track.sections[currentSectionIndex];
    const playerNotes = playerState.getPlayerNotes();

    return {
      playerNumber,
      playerIndex,
      playerCount,
      song,
      songBeatLength: GameState.getSongBeatLength(),
      minPitch: playerState.getMinPitch(),
      maxPitch: playerState.getMaxPitch(),
      canvas: this.canvas,
      currentTime: GameState.getCurrentTime(),
      frequencies: playerState.getPlayerFrequencies(),
      playerNotes,
      currentPlayerNotes: playerNotes.filter((note) => note.note.start >= (currentSection?.start ?? Infinity)),
      track,
      currentBeat: GameState.getCurrentBeat(),
      currentSectionIndex,
      currentSection,
      paddingVertical: this.verticalMargin,
    };
  };

  private getNoteCoords = (
    drawingData: DrawingData,
    { start, length }: Pick<Note, 'start' | 'length'>,
    pitch: number,
    big: boolean,
    displacement: [number, number] = [0, 0],
  ) => {
    const { sectionEndBeat, currentSection, playerCanvas, pitchStepHeight } = calculateData(drawingData);

    const sectionStart = isNotesSection(currentSection) ? currentSection.notes[0].start : 1;

    const beatLength = playerCanvas.width / (sectionEndBeat - sectionStart);

    const [dx, dy] = big ? displacement : [0, 0];
    const pitchY = pitchStepHeight * (drawingData.maxPitch - pitch + pitchPadding);

    return {
      x: Math.floor(playerCanvas.baseX + beatLength * (start - sectionStart) + dx),
      y: Math.floor(playerCanvas.baseY + 10 + pitchY + dy - (big ? 3 : 0)),
      w: Math.floor(beatLength * length),
      h: big ? BIG_NOTE_HEIGHT : NOTE_HEIGHT,
    };
  };

  private getPreciseY = (y: number, h: number, preciseDistance: number) => y + h / 2 - (preciseDistance * h) / 3;
}
