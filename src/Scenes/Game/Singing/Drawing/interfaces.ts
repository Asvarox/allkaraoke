export default interface Particle {
    tick: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, delta: number) => void;
    finished: boolean;
}
