import { PlayerNote } from 'interfaces';
import applyColor from 'Scenes/Game/Singing/GameOverlay/Drawing/applyColor';
import getNoteColor from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/utils/getNoteColor';
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
    applyColor(ctx, getNoteColor(ctx, playerNumber, isHit, playerNote));

    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(31,31,31, .7)';
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    roundRect(ctx!, x, y, width, height, 100, true, true, isHit ? 0.15 : 0);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}
