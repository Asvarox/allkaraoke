import { PlayerNumber } from '~/modules/players/player-number';
import { Note, PlayerNote } from '~/interfaces';
import { SpriteNames } from '~/modules/game-engine/drawing/elements/cache/sprite-map';
import drawSpriteWithStartAndEnd from '~/modules/game-engine/drawing/elements/sprite-with-start-and-end';

const getSpriteName = (playerNumber: PlayerNumber, isHit: boolean, isPerfect: boolean, isStar: boolean) => {
  let spriteName = `p${playerNumber}`;
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

const starNoteTypes: Note['type'][] = ['star', 'rapstar'];

export default function drawPlayerNote(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  playerNumber: PlayerNumber,
  isHit: boolean,
  playerNote: PlayerNote,
) {
  const spriteName = getSpriteName(
    playerNumber,
    isHit,
    playerNote.isPerfect,
    starNoteTypes.includes(playerNote.note.type),
  );

  drawSpriteWithStartAndEnd(ctx, spriteName, x, y, width);
}
