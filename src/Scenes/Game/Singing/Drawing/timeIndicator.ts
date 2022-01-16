import calculateData, { DrawingData } from './calculateData';

export default function drawTimeIndicator(ctx: CanvasRenderingContext2D, data: DrawingData) {
    const { currentTime, canvas, regionPaddingTop, regionHeight } = data;
    const { paddingHorizontal, maxTime, timeSectionGap } = calculateData(data);

    const relativeTime = Math.max(0, currentTime - timeSectionGap);

    const timeLineX = paddingHorizontal + (relativeTime / maxTime) * (canvas.width - 2 * paddingHorizontal);
    ctx!.strokeStyle = 'rgba(0, 0, 0, .5)';
    ctx!.beginPath();
    ctx!.moveTo(timeLineX, regionPaddingTop);
    ctx!.lineTo(timeLineX, regionPaddingTop + regionHeight);
    ctx!.stroke();
    ctx!.strokeStyle = 'rgba(255, 255, 255, .5)';
    ctx!.beginPath();
    ctx!.moveTo(timeLineX - 1, regionPaddingTop);
    ctx!.lineTo(timeLineX - 1, regionPaddingTop + regionHeight);
    ctx!.stroke();
}
