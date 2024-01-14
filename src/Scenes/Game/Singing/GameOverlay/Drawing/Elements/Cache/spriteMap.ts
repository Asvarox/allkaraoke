import { BIG_NOTE_HEIGHT, NOTE_HEIGHT } from 'Scenes/Game/Singing/GameOverlay/Drawing/calculateData';
import drawRawNote from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/Cache/Elements/note';
import drawRawPlayerNote from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/Cache/Elements/playerNote';

const SHADOW_PAD = 10;

export const smallNoteFragments = {
  start: { x: 0, y: 0, w: NOTE_HEIGHT / 2 + SHADOW_PAD, h: NOTE_HEIGHT + SHADOW_PAD * 2 },
  middle: { x: NOTE_HEIGHT / 2 + SHADOW_PAD, y: 0, w: 1, h: NOTE_HEIGHT + SHADOW_PAD * 2 },
  end: {
    x: NOTE_HEIGHT / 2 + 1 + SHADOW_PAD,
    y: 0,
    w: NOTE_HEIGHT / 2 + SHADOW_PAD,
    h: NOTE_HEIGHT + SHADOW_PAD * 2,
  },
};
export const bigNoteFragments = {
  start: { x: 0, y: 0, w: BIG_NOTE_HEIGHT / 2 + SHADOW_PAD, h: BIG_NOTE_HEIGHT + SHADOW_PAD * 2 },
  middle: { x: BIG_NOTE_HEIGHT / 2 + SHADOW_PAD, y: 0, w: 1, h: BIG_NOTE_HEIGHT + SHADOW_PAD * 2 },
  end: {
    x: BIG_NOTE_HEIGHT / 2 + 1 + SHADOW_PAD,
    y: 0,
    w: BIG_NOTE_HEIGHT / 2 + SHADOW_PAD,
    h: BIG_NOTE_HEIGHT + SHADOW_PAD * 2,
  },
};

const spriteMap = {
  blueMiss: {
    draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
      drawRawPlayerNote(ctx, x, y, w, h, 0, false, false, false),
    width: NOTE_HEIGHT + 1,
    height: NOTE_HEIGHT,
    padding: SHADOW_PAD,
    fragments: smallNoteFragments,
  },
  blueHit: {
    draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
      drawRawPlayerNote(ctx, x, y, w, h, 0, true, false, false),
    width: BIG_NOTE_HEIGHT + 1,
    height: BIG_NOTE_HEIGHT,
    padding: SHADOW_PAD,
    fragments: bigNoteFragments,
  },
  bluePerfect: {
    draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
      drawRawPlayerNote(ctx, x, y, w, h, 0, true, true, false),
    width: BIG_NOTE_HEIGHT + 1,
    height: BIG_NOTE_HEIGHT,
    padding: SHADOW_PAD,
    fragments: bigNoteFragments,
  },
  blueStarMiss: {
    draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
      drawRawPlayerNote(ctx, x, y, w, h, 0, false, false, true),
    width: NOTE_HEIGHT + 1,
    height: NOTE_HEIGHT,
    padding: SHADOW_PAD,
    fragments: smallNoteFragments,
  },
  blueStarHit: {
    draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
      drawRawPlayerNote(ctx, x, y, w, h, 0, true, false, true),
    width: BIG_NOTE_HEIGHT + 1,
    height: BIG_NOTE_HEIGHT,
    padding: SHADOW_PAD,
    fragments: bigNoteFragments,
  },
  blueStarPerfect: {
    draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
      drawRawPlayerNote(ctx, x, y, w, h, 0, true, true, true),
    width: BIG_NOTE_HEIGHT + 1,
    height: BIG_NOTE_HEIGHT,
    padding: SHADOW_PAD,
    fragments: bigNoteFragments,
  },
  redMiss: {
    draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
      drawRawPlayerNote(ctx, x, y, w, h, 1, false, false, false),
    width: NOTE_HEIGHT + 1,
    height: NOTE_HEIGHT,
    padding: SHADOW_PAD,
    fragments: smallNoteFragments,
  },
  redHit: {
    draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
      drawRawPlayerNote(ctx, x, y, w, h, 1, true, false, false),
    width: BIG_NOTE_HEIGHT + 1,
    height: BIG_NOTE_HEIGHT,
    padding: SHADOW_PAD,
    fragments: bigNoteFragments,
  },
  redPerfect: {
    draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
      drawRawPlayerNote(ctx, x, y, w, h, 1, true, true, false),
    width: BIG_NOTE_HEIGHT + 1,
    height: BIG_NOTE_HEIGHT,
    padding: SHADOW_PAD,
    fragments: bigNoteFragments,
  },
  redStarMiss: {
    draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
      drawRawPlayerNote(ctx, x, y, w, h, 1, false, false, true),
    width: NOTE_HEIGHT + 1,
    height: NOTE_HEIGHT,
    padding: SHADOW_PAD,
    fragments: smallNoteFragments,
  },
  redStarHit: {
    draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
      drawRawPlayerNote(ctx, x, y, w, h, 1, true, false, true),
    width: BIG_NOTE_HEIGHT + 1,
    height: BIG_NOTE_HEIGHT,
    padding: SHADOW_PAD,
    fragments: bigNoteFragments,
  },
  redStarPerfect: {
    draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
      drawRawPlayerNote(ctx, x, y, w, h, 1, true, true, true),
    width: BIG_NOTE_HEIGHT + 1,
    height: BIG_NOTE_HEIGHT,
    padding: SHADOW_PAD,
    fragments: bigNoteFragments,
  },
  noteNormal: {
    draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
      drawRawNote(ctx, x, y, w, h, 'normal'),
    width: BIG_NOTE_HEIGHT + 1,
    height: BIG_NOTE_HEIGHT,
    padding: SHADOW_PAD,
    fragments: bigNoteFragments,
  },
  noteStar: {
    draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
      drawRawNote(ctx, x, y, w, h, 'star'),
    width: BIG_NOTE_HEIGHT + 1,
    height: BIG_NOTE_HEIGHT,
    padding: SHADOW_PAD,
    fragments: bigNoteFragments,
  },
  noteFreestyle: {
    draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
      drawRawNote(ctx, x, y, w, h, 'freestyle'),
    width: BIG_NOTE_HEIGHT + 1,
    height: BIG_NOTE_HEIGHT,
    padding: SHADOW_PAD,
    fragments: bigNoteFragments,
  },
  noteRap: {
    draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
      drawRawNote(ctx, x, y, w, h, 'rap'),
    width: BIG_NOTE_HEIGHT + 1,
    height: BIG_NOTE_HEIGHT,
    padding: SHADOW_PAD,
    fragments: bigNoteFragments,
  },
  noteRapstar: {
    draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
      drawRawNote(ctx, x, y, w, h, 'rapstar'),
    width: BIG_NOTE_HEIGHT + 1,
    height: BIG_NOTE_HEIGHT,
    padding: SHADOW_PAD,
    fragments: bigNoteFragments,
  },
};

export type SpriteNames = keyof typeof spriteMap;

export default spriteMap;
