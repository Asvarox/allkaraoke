import Particle from '../interfaces';
import particleImage from './particle.png';

let imageLoaded = false;
const image = new Image();
image.onload = () => (imageLoaded = true);

image.src = particleImage;

const initialTtl = (50 / 60) * 1000;
const velocity = 0.05;

const WIDTH = 100;
const WIDTH_SPREAD = 4;

const pow = Math.pow;

function easeOutQuart(x: number): number {
    return 1 - pow(1 - x, 2);
}

export default class RayParticle implements Particle {
    public finished = false;

    private ttl;
    private velocityX;
    private velocityY;
    private maxWidth;

    constructor(private x: number, private y: number, seed: number, widthModifier: number) {
        this.ttl = initialTtl;
        this.velocityX = velocity * Math.random() - velocity / 2;
        this.velocityY = velocity * Math.random() - velocity / 2;
        this.maxWidth =
            Math.min(0.1 + widthModifier, 1) * (Math.sin(seed / 70) * WIDTH_SPREAD + (WIDTH - WIDTH_SPREAD));
    }
    public tick = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, delta: number) => {
        if (imageLoaded) {
            const percentage = this.ttl / initialTtl;
            let easing = easeOutQuart(1 - Math.min(1, (1 - percentage) * 6));

            const mainRayWidth = (this.maxWidth * easing * 3) / 4;
            const mainRayHeight = this.maxWidth * easing;

            ctx.globalAlpha = easing * 0.35;
            ctx.drawImage(image, this.x - mainRayWidth / 2, this.y - mainRayHeight / 2, mainRayWidth, mainRayHeight);

            easing = easeOutQuart(percentage);

            const width = (easing * this.maxWidth) / 4;
            const height = (easing * this.maxWidth) / 4;

            const x = this.x - width / 2;
            const y = this.y - height / 2;

            const elapsedTicks = initialTtl - this.ttl;

            ctx.globalAlpha = easing * 0.2;
            ctx.drawImage(image, x + elapsedTicks * this.velocityX, y + elapsedTicks * this.velocityY, width, height);
            ctx.globalAlpha = 1;
        }

        this.ttl = this.ttl - delta;
        this.finished = this.ttl <= 0;
    };
}
