import debris from 'modules/GameEngine/Drawing/Elements/debris';
import spreadValue from 'modules/GameEngine/Drawing/Particles/utils';
import Particle from '../interfaces';

const baseTtlMs = 300;
const ttlSpreadMs = 50;

const velocityModifier = 1.3;

export default class SungTriangle implements Particle {
  public finished = false;

  private ttl;
  private startingTtl;
  private velocityX;
  private velocityY;
  private width;
  private initialAngle;
  private heightModifier;

  constructor(
    private x: number,
    private y: number,
    private color: string,
  ) {
    this.startingTtl = this.ttl = spreadValue(baseTtlMs, ttlSpreadMs);
    this.velocityX = velocityModifier * Math.random() - velocityModifier / 2;
    this.velocityY = velocityModifier * Math.random() - velocityModifier / 2;
    this.width = 25;
    this.initialAngle = 180 - Math.random() * 360;
    this.heightModifier = 0.5 + Math.random() / 2;
  }
  public tick = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, delta: number) => {
    const percentage = 1 - this.ttl / this.startingTtl;
    const ticksLeft = this.ttl;

    const width = this.width * percentage;
    const height = this.width * this.heightModifier * percentage;

    const x = this.x - width / 2 + ticksLeft * this.velocityX;
    const y = this.y + height / 2 + ticksLeft * this.velocityY;

    debris(canvas, ctx, x, y, width, height, this.initialAngle + ticksLeft, this.color, 0.7 * percentage);

    this.ttl = this.ttl - delta;
    this.finished = this.ttl <= 0;
  };
}
