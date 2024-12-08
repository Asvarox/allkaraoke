import { Note } from 'interfaces';
import drawNote from '../Elements/note';
import Particle from '../interfaces';

const initialTtl = 300;

export default class FadeoutNote implements Particle {
  public finished = false;
  public ttl = initialTtl;

  constructor(
    private x: number,
    private y: number,
    private width: number,
    private note: Note,
    private playerNumber: 0 | 1 | 2 | 3,
  ) {}

  public tick = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, delta: number) => {
    const percentage = this.ttl / initialTtl;

    ctx.save();
    ctx.globalAlpha = percentage;
    ctx.translate(Math.round(canvas.width * (percentage - 1)), 0);

    drawNote(ctx, this.x, this.y, this.width, this.note, this.playerNumber);

    ctx.globalAlpha = 1;
    ctx.restore();

    this.ttl = this.ttl - delta;
    this.finished = this.ttl <= 0;
  };
}
