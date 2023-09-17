import Particle from './interfaces';

class ParticleManager {
  private particles: Particle[] = [];
  private lastTick = Date.now();

  private getTimeDelta = (timeShift: number) => {
    const currentTick = Date.now() - timeShift;
    const delta = currentTick - this.lastTick;
    this.lastTick = currentTick;

    return delta;
  };

  public tick = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, timeShift = 0) => {
    const delta = this.getTimeDelta(timeShift);

    this.particles.forEach((particle) => particle.tick(ctx, canvas, delta));

    this.particles = this.particles.filter((particle) => !particle.finished);
  };

  public add = (particle: Particle) => this.particles.push(particle);
}

export default new ParticleManager();
