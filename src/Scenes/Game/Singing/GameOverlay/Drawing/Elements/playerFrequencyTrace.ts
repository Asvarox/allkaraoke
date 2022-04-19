import { PlayerNote } from 'interfaces';
import roundRect from './roundRect';

export default function drawPlayerFrequencyTrace(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    playerNote: PlayerNote,
) {
    ctx.save();
    roundRect(ctx, x, y, width, height, 100, false, false);
    ctx.clip();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255, .35)';
    ctx.lineWidth = 3;
    ctx.moveTo(x, y + height / 2 - (playerNote.frequencyRecords[0].preciseDistance * height) / 3);
    for (let i = 1; i < playerNote.frequencyRecords.length; i++) {
        ctx.lineTo(
            x + i * (width / (playerNote.frequencyRecords.length - 1)),
            y + height / 2 - (playerNote.frequencyRecords[i].preciseDistance * height) / 3,
        );
    }
    ctx.stroke();
    ctx.closePath();

    ctx.restore();
}
