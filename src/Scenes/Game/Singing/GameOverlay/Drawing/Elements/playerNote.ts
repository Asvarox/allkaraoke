import { PlayerNote } from 'interfaces';
import applyColor from '../applyColor';
import styles from '../styles';
import roundRect from './roundRect';

export default function drawPlayerNote(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    playerNumber: number,
    isHit: boolean,
    playerNote: PlayerNote,
) {
    if (playerNote.isPerfect && playerNote.note.type === 'star') {
        applyColor(ctx, styles.colors.players[playerNumber].starPerfect);
    } else if (playerNote.isPerfect) {
        applyColor(ctx, styles.colors.players[playerNumber].perfect);
    } else if (playerNote.note.type === 'star' && isHit) {
        applyColor(ctx, styles.colors.players[playerNumber].star);
    } else if (isHit) {
        applyColor(ctx, styles.colors.players[playerNumber].hit);
    } else {
        applyColor(ctx, styles.colors.players[playerNumber].miss);
    }

    roundRect(ctx!, x, y, width, height, 100, true, true);
}
