import { add } from 'lodash-es';
import spriteMap, {
  smallNoteFragments,
  SpriteNames,
} from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/Cache/spriteMap';
import createCanvas from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/Cache/utils/createCanvas';

const maxWidth = Math.max(...Object.values(spriteMap).map((sprite) => sprite.padding * 2 + sprite.width));
const height = Object.values(spriteMap)
  .map((sprite) => sprite.padding * 2 + sprite.height)
  .reduce(add, 0);

const cachedCanvas = createCanvas(maxWidth, height);
const ctx = cachedCanvas.getContext('2d')!;

let currentHeight = 0;
const positions = Object.entries(spriteMap)
  .map(([name, sprite]) => {
    const pads = sprite.padding * 2;
    const position = { name, x: 0, y: currentHeight, w: sprite.width + pads, h: sprite.height + pads };
    currentHeight = currentHeight + sprite.height + pads;

    return position;
  })
  .reduce(
    (acc, position) => ({ ...acc, [position.name]: position }),
    {} as Record<SpriteNames, { x: number; y: number; w: number; h: number }>,
  );

currentHeight = 0;
Object.entries(spriteMap).forEach(([key, entry]) => {
  entry.draw(ctx, entry.padding, currentHeight + entry.padding, entry.width, entry.height);
  currentHeight = currentHeight + entry.padding * 2 + entry.height;
});

export const getSprite = (sprite: SpriteNames, fragment: keyof typeof smallNoteFragments) => {
  return {
    canvas: cachedCanvas,
    ctx,
    x: positions[sprite].x + spriteMap[sprite].fragments[fragment].x,
    y: positions[sprite].y + spriteMap[sprite].fragments[fragment].y,
    w: spriteMap[sprite].fragments[fragment].w,
    h: spriteMap[sprite].fragments[fragment].h,
    padding: spriteMap[sprite].padding,
  };
};

export const drawSprite = (
  destCtx: CanvasRenderingContext2D,
  sprite: SpriteNames,
  fragment: keyof typeof smallNoteFragments,
  destX: number,
  destY: number,
  destW?: number,
  destH?: number,
  paddingWScale = 1,
  paddingHScale = 1,
) => {
  const spriteData = getSprite(sprite, fragment);
  const { canvas, w, h, y, x, padding } = spriteData;
  const finalWPadding = padding * paddingWScale;
  const finalHPadding = padding * paddingHScale;

  destCtx.imageSmoothingEnabled = false;
  destCtx.drawImage(canvas, x, y, w, h, destX - finalWPadding, destY - finalHPadding, destW ?? w, destH ?? h);
  destCtx.imageSmoothingEnabled = true;

  return spriteData;
};
