import { Note } from 'interfaces';
import { capitalize } from 'lodash-es';
import { SpriteNames } from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/Cache/spriteMap';
import drawSpriteWithStartAndEnd from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/spriteWithStartAndEnd';

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
