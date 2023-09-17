import { BIG_NOTE_HEIGHT } from 'Scenes/Game/Singing/GameOverlay/Drawing/calculateData';
import { Note } from 'interfaces';
import drawNote from '../Elements/note';
import Particle from '../interfaces';

const initialTtl = 200;

export default class FadeoutNote implements Particle {
  public finished = false;
  public ttl = initialTtl;

  constructor(private x: number, private y: number, private width: number, private note: Note) {}

  public tick = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, delta: number) => {
    const percentage = this.ttl / initialTtl;

    ctx.save();
    ctx.globalAlpha = percentage;
    ctx.translate(0, BIG_NOTE_HEIGHT * (1 - percentage));

    drawNote(ctx, this.x, this.y, this.width, this.note);

    ctx.globalAlpha = 1;
    ctx.restore();

    this.ttl = this.ttl - delta;
    this.finished = this.ttl <= 0;
  };
}
