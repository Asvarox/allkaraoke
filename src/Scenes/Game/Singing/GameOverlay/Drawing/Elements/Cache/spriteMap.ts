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

const getPlayerSprite = (
  playerNumber: 0 | 1 | 2 | 3,
  isHit: boolean,
  isPerfect: boolean,
  isStar: boolean,
  isBig: boolean,
) => ({
  draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
    drawRawPlayerNote(ctx, x, y, w, h, playerNumber, isHit, isPerfect, isStar),
  width: NOTE_HEIGHT + 1,
  height: NOTE_HEIGHT,
  padding: SHADOW_PAD,
  fragments: isBig ? bigNoteFragments : smallNoteFragments,
});

type PlayerSpriteNames = `p${0 | 1 | 2 | 3}${
  | 'Normal'
  | 'Miss'
  | 'Hit'
  | 'Perfect'
  | 'StarMiss'
  | 'StarHit'
  | 'StarPerfect'}`;

const getAllPlayerSprites = (playerNumber: 0 | 1 | 2 | 3) =>
  ({
    [`p${playerNumber}Normal`]: {
      draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) =>
        drawRawNote(ctx, x, y, w, h, 'normal', playerNumber),
      width: BIG_NOTE_HEIGHT + 1,
      height: BIG_NOTE_HEIGHT,
      padding: SHADOW_PAD,
      fragments: bigNoteFragments,
    },
    [`p${playerNumber}Miss`]: getPlayerSprite(playerNumber, false, false, false, false),
    [`p${playerNumber}Hit`]: getPlayerSprite(playerNumber, true, false, false, true),
    [`p${playerNumber}Perfect`]: getPlayerSprite(playerNumber, true, true, false, true),
    [`p${playerNumber}StarMiss`]: getPlayerSprite(playerNumber, false, false, true, false),
    [`p${playerNumber}StarHit`]: getPlayerSprite(playerNumber, true, false, true, true),
    [`p${playerNumber}StarPerfect`]: getPlayerSprite(playerNumber, true, true, true, true),
  } as Record<PlayerSpriteNames, ReturnType<typeof getPlayerSprite>>);

const spriteMap = {
  ...getAllPlayerSprites(0),
  ...getAllPlayerSprites(1),
  ...getAllPlayerSprites(2),
  ...getAllPlayerSprites(3),
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

export type SpriteNames = keyof typeof spriteMap | PlayerSpriteNames;

export default spriteMap;
