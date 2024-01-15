import roundRect from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/roundRect';
import applyColor from 'Scenes/Game/Singing/GameOverlay/Drawing/applyColor';
import { Note } from 'interfaces';
import styles from '../../../styles';

export default function drawRawNote(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  noteType: Note['type'],
) {
  if (noteType === 'star') {
    applyColor(ctx, styles.colors.lines.star);
  } else if (noteType === 'freestyle' || noteType === 'rap') {
    applyColor(ctx, styles.colors.lines.freestyle);
  } else if (noteType === 'rapstar') {
    applyColor(ctx, { ...styles.colors.lines.star, fill: styles.colors.lines.freestyle.fill });
  } else {
    applyColor(ctx, styles.colors.lines.normal);
  }

  ctx.shadowBlur = 10;
  ctx.shadowColor = 'rgb(31,31,31)';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  roundRect(ctx!, x, y, width, height, 100, true, true, 0.075);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}
