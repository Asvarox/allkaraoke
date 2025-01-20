import ray from './ray';

export default function debris(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  _angle: number,
  color: string | CanvasGradient | CanvasPattern,
  alpha: number = 1,
) {
  if (width > 0) {
    ray(canvas, ctx, x, y, width, height, color, alpha);
  }
}
