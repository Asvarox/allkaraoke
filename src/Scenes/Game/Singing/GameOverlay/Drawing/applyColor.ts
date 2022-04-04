export default function applyColor(
    ctx: CanvasRenderingContext2D,
    style: { fill: string; stroke: string; lineWidth: number },
) {
    ctx.fillStyle = style.fill;
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.lineWidth;
}
