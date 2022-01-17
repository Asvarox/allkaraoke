export default interface Particle {
    tick: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
    finished: boolean;
}
