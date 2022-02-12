import Particle from '../interfaces';

const initialTtl = 50;

const velocityModifier = 5;

export default class TriangleParticle implements Particle {
    public finished = false;

    private ttl;
    private velocityX;
    private velocityY;
    private width;
    private initialAngle;
    private heightModifier;

    constructor(private x: number, private y: number, private color: string, delay: number) {
        this.ttl = initialTtl + delay; // initialTtl + (initialTtl / 4) * (Math.random() - 0.5);
        this.velocityX = velocityModifier * Math.random() - velocityModifier / 2;
        this.velocityY = velocityModifier * Math.random() - velocityModifier / 2;
        this.width = 25;
        this.initialAngle = 180 - Math.random() * 360;
        this.heightModifier = Math.random();
    }
    public tick = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        if (this.ttl <= initialTtl) {
            const percentage = this.ttl / initialTtl;
            const elapsedTicks = initialTtl - this.ttl;

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

        this.ttl = this.ttl - 1;
        this.finished = this.ttl <= 0;
    };
}
