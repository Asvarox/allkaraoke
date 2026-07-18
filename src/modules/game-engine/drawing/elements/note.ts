import { capitalize } from 'es-toolkit';

import { Note } from '~/interfaces';
import { SpriteNames } from '~/modules/game-engine/drawing/elements/cache/sprite-map';
import drawSpriteWithStartAndEnd from '~/modules/game-engine/drawing/elements/sprite-with-start-and-end';

const getSpriteName = (noteType: Note['type'], playerNumber?: 0 | 1 | 2 | 3) => {
  return `${playerNumber !== undefined && noteType === 'normal' ? `p${playerNumber}` : 'note'}${capitalize(
    noteType,
  )}` as SpriteNames;
};

export default function drawNote(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  note: Note,
  playerNumber?: 0 | 1 | 2 | 3,
) {
  const spriteName = getSpriteName(note.type, playerNumber);

  drawSpriteWithStartAndEnd(ctx, spriteName, x, y, width);
}
