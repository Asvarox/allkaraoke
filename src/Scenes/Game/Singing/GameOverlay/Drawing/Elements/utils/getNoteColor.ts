import { PlayerNote } from 'interfaces';
import styles from '../../styles';

export default function getNoteColor(
    ctx: CanvasRenderingContext2D,
    playerNumber: number,
    isHit: boolean,
    playerNote: PlayerNote,
) {
    if (playerNote.isPerfect && playerNote.note.type === 'star') {
        return styles.colors.players[playerNumber].starPerfect;
    } else if (playerNote.isPerfect) {
        return styles.colors.players[playerNumber].perfect;
    } else if (playerNote.note.type === 'star' && isHit) {
        return styles.colors.players[playerNumber].star;
    } else if (isHit) {
        return styles.colors.players[playerNumber].hit;
    } else {
        return styles.colors.players[playerNumber].miss;
    }
}
