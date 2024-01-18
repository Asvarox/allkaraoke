import calculateData, { DrawingData } from 'Scenes/Game/Singing/GameOverlay/Drawing/calculateData';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';

export const drawPlayerCanvas = (drawingData: DrawingData) => {
  const ctx = drawingData.canvas.getContext('2d')!;
  const { playerCanvas } = calculateData(drawingData);

  ctx.fillStyle = styles.colors.players[drawingData.playerIndex].miss.fill;
  ctx.fillRect(playerCanvas.baseX, playerCanvas.baseY, playerCanvas.width, playerCanvas.height);
};
