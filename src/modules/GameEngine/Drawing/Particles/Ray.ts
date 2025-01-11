import ray from 'modules/GameEngine/Drawing/Elements/ray';
import Particle from '../interfaces';

const initialTtl = (50 / 60) * 1000;
const velocity = 0.05;

const WIDTH = 200;
const WIDTH_SPREAD = 4;

const pow = Math.pow;

function easeOutQuart(x: number): number {
  return 1 - pow(1 - x, 2);
}
function interpolateColor(value: number): string {
  const percentage = Math.round(value * 100);

  const r = 255;
  const g = Math.min(255, Math.max(0, Math.round((255 * (200 - percentage * 2)) / 100)));
  const b = Math.max(0, Math.round((255 * (100 - percentage)) / 100));

  return `rgb(${r}, ${g}, ${b})`;
}

export default class RayParticle implements Particle {
  public finished = false;

  private ttl;
  private velocityX;
  private velocityY;
  private maxWidth;

  constructor(
    private x: number,
    private y: number,
    seed: number,
    widthModifier: number,
  ) {
    this.ttl = initialTtl;
    this.velocityX = velocity * Math.random() - velocity / 2;
    this.velocityY = velocity * Math.random() - velocity / 2;
    this.maxWidth = Math.min(0.1 + widthModifier, 1) * (Math.sin(seed / 70) * WIDTH_SPREAD + (WIDTH - WIDTH_SPREAD));
  }
  public tick = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, delta: number) => {
    const percentage = this.ttl / initialTtl;
    let easing = easeOutQuart(1 - Math.min(1, (1 - percentage) * 6));

    const mainRayWidth = (this.maxWidth * easing * 3) / 4;
    const mainRayHeight = this.maxWidth * easing;

    const clr = interpolateColor(1 - percentage);

    ray(canvas, ctx, this.x, this.y, mainRayWidth, mainRayHeight, 'white', easing * 0.35);

    easing = easeOutQuart(percentage);

    const width = (easing * this.maxWidth) / 2;
    const height = (easing * this.maxWidth) / 2;

    const x = this.x;
    const y = this.y;

    const elapsedTicks = initialTtl - this.ttl;

    ctx.globalAlpha = easing * 0.2;
    ray(
      canvas,
      ctx,
      x + elapsedTicks * this.velocityX,
      y + elapsedTicks * this.velocityY,
      width,
      height,
      clr,
      easing * 0.2,
    );

    this.ttl = this.ttl - delta;
    this.finished = this.ttl <= 0;
  };
}
