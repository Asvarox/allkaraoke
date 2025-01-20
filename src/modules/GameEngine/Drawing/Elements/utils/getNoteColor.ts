import { PlayerNote } from 'interfaces';
import styles from '../../styles';

export function getColor(
  _ctx: CanvasRenderingContext2D,
  playerNumber: 0 | 1 | 2 | 3,
  isStar: boolean,
  isHit: boolean,
  isPerfect: boolean,
) {
  if (isPerfect && isStar) {
    return styles.colors.players[playerNumber].starPerfect;
  } else if (isPerfect) {
    return styles.colors.players[playerNumber].perfect;
  } else if (isStar && isHit) {
    return styles.colors.players[playerNumber].star;
  } else if (isHit) {
    return styles.colors.players[playerNumber].hit;
  } else {
    return styles.colors.players[playerNumber].miss;
  }
}

export default function getNoteColor(
  ctx: CanvasRenderingContext2D,
  playerNumber: 0 | 1 | 2 | 3,
  isHit: boolean,
  playerNote: PlayerNote,
) {
  return getColor(ctx, playerNumber, playerNote.note.type === 'star', isHit, playerNote.isPerfect);
}
