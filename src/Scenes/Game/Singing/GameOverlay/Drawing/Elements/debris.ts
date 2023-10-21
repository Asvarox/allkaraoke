import { captureMessage, setExtras } from '@sentry/react';
import ray from './ray';

export default function debris(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number,
  color: string | CanvasGradient | CanvasPattern,
  alpha: number = 1,
) {
  if (width > 0) {
    ray(canvas, ctx, x, y, width, height, color, alpha);
  } else {
    setExtras({ x, y, width, height, angle, color, alpha });
    captureMessage('Debris with negative width');
  }
}

function triangle(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number,
  color: string | CanvasGradient | CanvasPattern,
  alpha: number = 1,
) {
  ctx.save();

  // move to the center of the canvas
  const finalX = x - width / 2;
  const finalY = y - height / 2;

  ctx.translate(finalX, finalY);

  // rotate the canvas to the specified degrees
  ctx.rotate((angle * Math.PI) / 180);

  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0 - width / 2, height / 2);
  ctx.lineTo(width / 2, height / 2);
  ctx.lineTo(width / 2, 0);
  ctx.lineTo(width / 2, 0 - height / 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}
