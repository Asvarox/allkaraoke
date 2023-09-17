import { PlayerNote } from 'interfaces';
import { SpriteNames } from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/Cache/spriteMap';
import drawSpriteWithStartAndEnd from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/spriteWithStartAndEnd';

const getSpriteName = (playerNumber: number, isHit: boolean, isPerfect: boolean, isStar: boolean) => {
  let spriteName = playerNumber === 0 ? 'blue' : 'red';
  if (isPerfect && isStar) {
    spriteName = `${spriteName}StarPerfect`;
  } else if (isPerfect) {
    spriteName = `${spriteName}Perfect`;
  } else if (isStar && isHit) {
    spriteName = `${spriteName}StarHit`;
  } else if (isHit) {
    spriteName = `${spriteName}Hit`;
  } else if (isStar && !isHit) {
    spriteName = `${spriteName}StarMiss`;
  } else {
    spriteName = `${spriteName}Miss`;
  }

  return spriteName as SpriteNames;
};

export default function drawPlayerNote(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  playerNumber: number,
  isHit: boolean,
  playerNote: PlayerNote,
) {
  const spriteName = getSpriteName(playerNumber, isHit, playerNote.isPerfect, playerNote.note.type === 'star');

  drawSpriteWithStartAndEnd(ctx, spriteName, x, y, width);
}
