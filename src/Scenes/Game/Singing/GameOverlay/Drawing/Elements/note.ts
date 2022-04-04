import { Note } from '../../../../../../interfaces';
import applyColor from '../applyColor';
import styles from '../styles';
import roundRect from './roundRect';

export default function drawNote(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    note: Note,
) {
    if (note.type === 'star') {
        applyColor(ctx, styles.colors.lines.star);
    } else if (note.type === 'freestyle' || note.type === 'rap') {
        applyColor(ctx, styles.colors.lines.freestyle);
    } else {
        applyColor(ctx, styles.colors.lines.normal);
    }

    roundRect(ctx!, x, y, width, height, 100, true, true);
}
