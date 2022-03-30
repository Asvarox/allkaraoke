import Particle from '../interfaces';
import spreadValue from './spreadValue';

const baseTtl = (50 / 60) * 1000;
const ttlSpread = (25 / 60) * 1000;

const velocityModifier = 1.65;

export default class TriangleParticle implements Particle {
    public finished = false;

    private ttl;
    private startingTtl;
    private velocityX;
    private velocityY;
    private width;
    private initialAngle;
    private heightModifier;

    constructor(private x: number, private y: number, private color: string, private delay: number) {
        this.startingTtl = this.ttl = spreadValue(baseTtl, ttlSpread);
        this.velocityX = velocityModifier * Math.random() - velocityModifier / 2;
        this.velocityY = velocityModifier * Math.random() - velocityModifier / 2;
        this.width = 25;
        this.initialAngle = 180 - Math.random() * 360;
        this.heightModifier = Math.random();
    }
    public tick = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, delta: number) => {
        if (this.delay-- > 0) return;
        if (true) {
            const percentage = this.ttl / this.startingTtl;
            const elapsedTicks = this.startingTtl - this.ttl;

            const width = this.width * percentage;
            const height = this.width * this.heightModifier * percentage;

            // save the unrotated context of the canvas so we can restore it later
            // the alternative is to untranslate & unrotate after drawing
            ctx.save();

            // move to the center of the canvas
            const x = this.x - width / 2;
            const y = this.y - height / 2;

            ctx.translate(x + elapsedTicks * this.velocityX, y + elapsedTicks * this.velocityY);

            // rotate the canvas to the specified degrees
            ctx.rotate(((this.initialAngle + elapsedTicks) * Math.PI) / 180);

            ctx.globalAlpha = 0.8 * percentage;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(0 - width / 2, height / 2);
            ctx.lineTo(width / 2, height / 2);
            ctx.lineTo(width / 2, 0);
            ctx.lineTo(width / 2, 0 - height / 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.restore();
        }

        this.ttl = this.ttl - delta;
        this.finished = this.ttl <= 0;
    };
}
