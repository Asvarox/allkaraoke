import calculateData, { DrawingData } from '~/modules/game-engine/drawing/calculate-data';
import styles from '~/modules/game-engine/drawing/styles';

export const drawPlayerCanvas = (drawingData: DrawingData) => {
  const ctx = drawingData.canvas.getContext('2d')!;
  const { playerCanvas } = calculateData(drawingData);

  ctx.fillStyle = styles.colors.players[drawingData.playerIndex].miss.fill;
  ctx.fillRect(playerCanvas.baseX, playerCanvas.baseY, playerCanvas.width, playerCanvas.height);
};
