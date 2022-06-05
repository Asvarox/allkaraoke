import applyColor from 'Scenes/Game/Singing/GameOverlay/Drawing/applyColor';
import roundRect from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/roundRect';
import * as test from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/utils/getNoteColor';

export default function drawRawPlayerNote(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    playerNumber: number,
    isHit: boolean,
    isPerfect: boolean,
    isStar: boolean,
) {
    applyColor(ctx, test.getColor(ctx, playerNumber, isStar, isHit, isPerfect));

    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(31,31,31, .7)';
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    roundRect(ctx!, x, y, width, height, 100, true, true, isHit ? 0.15 : 0);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}
