import Particle from './interfaces';

class ParticleManager {
    private particles: Particle[] = [];

    public tick = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        this.particles.forEach((particle) => particle.tick(ctx, canvas));

        this.particles = this.particles.filter((particle) => !particle.finished);
    };

    public add = (particle: Particle) => this.particles.push(particle);
}

export default new ParticleManager();
