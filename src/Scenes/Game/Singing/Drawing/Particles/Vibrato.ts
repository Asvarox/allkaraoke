import Particle from '../interfaces';

const INTERVAL_PX = 20;

export default class VibratoParticle implements Particle {
    public finished = false;
    public ttl = 2;

    constructor(private x: number, private y: number, private w: number, private h: number, private seed: number) {}
    public tick = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        ctx.strokeStyle = 'rgba(255,255,255,.25)';
        ctx.lineWidth = 2;

        ctx.beginPath();

        for (let i = 0; i < this.w; i++) {
            const x = this.x + this.w - i;
            const deltaY = (this.h / 2 + 2) * Math.sin(x / INTERVAL_PX + this.seed / 250);
            ctx.lineTo(x, this.y + this.h / 2 + deltaY);
        }

        ctx.stroke();

        ctx.beginPath();

        for (let i = 0; i < this.w; i++) {
            const x = this.x + this.w - i;
            const deltaY = -1 * (this.h / 2 + 2) * Math.sin(x / INTERVAL_PX + this.seed / 250);
            ctx.lineTo(x, this.y + this.h / 2 + deltaY);
        }

        ctx.stroke();

        this.ttl = this.ttl - 1;
        this.finished = this.ttl === 0;
    };
}
