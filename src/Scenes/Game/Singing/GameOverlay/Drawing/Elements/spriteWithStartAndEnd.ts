import { drawSprite, getSprite } from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/Cache/cachedSprites';
import { SpriteNames } from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/Cache/spriteMap';

export default function drawSpriteWithStartAndEnd(
  ctx: CanvasRenderingContext2D,
  spriteName: SpriteNames,
  x: number,
  y: number,
  width: number,
) {
  const startData = getSprite(spriteName, 'start');

  const actualWidth = Math.max(width, (startData.h - startData.padding * 2) / 2);

  const widthScale = Math.min(1, actualWidth / 2 / (startData.w - startData.padding));
  const endingsWidth = widthScale * startData.w;
  const endingsSize = endingsWidth - startData.padding * widthScale;

  const middleSize = actualWidth - 2 * endingsSize;

  drawSprite(ctx, spriteName, 'start', x, y, endingsWidth, undefined, widthScale);
  if (middleSize > 0) {
    drawSprite(ctx, spriteName, 'middle', x + endingsWidth, y, middleSize, undefined, widthScale);
  }
  drawSprite(ctx, spriteName, 'end', x + middleSize + endingsWidth, y, endingsWidth, undefined, widthScale);
}
