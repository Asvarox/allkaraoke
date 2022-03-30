import Particle from './interfaces';

class ParticleManager {
    private particles: Particle[] = [];
    private lastTick = Date.now();

    private getTimeDelta = () => {
        const currentTick = Date.now();
        const delta = currentTick - this.lastTick;
        this.lastTick = currentTick;

        return delta;
    };

    public tick = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        const delta = this.getTimeDelta();

        this.particles.forEach((particle) => particle.tick(ctx, canvas, delta));

        this.particles = this.particles.filter((particle) => !particle.finished);
    };

    public add = (particle: Particle) => this.particles.push(particle);
}

export default new ParticleManager();
