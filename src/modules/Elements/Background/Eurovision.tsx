import {
  eurovisionBlueFillBase,
  eurovisionGreenFillBase,
  eurovisionPinkFillBase,
  eurovisionRedFillBase,
} from 'modules/GameEngine/Drawing/styles';
import { useEffect, useRef } from 'react';
import { useWindowSize } from 'react-use';
import eurovisionIcon from './eurovision-icon.png';

const icon = new Image();
icon.src = eurovisionIcon;

export const EurovisionBackground = () => {
  const canvas = useRef<HTMLCanvasElement>(null);

  const size = useWindowSize();

  useEffect(() => {
    let isRunning = true;
    // icon.src = '/eurovision-icon.png';

    const startAnimation = () => {
      if (!canvas.current) return;

      canvas.current.width = window.innerWidth;
      canvas.current.height = window.innerHeight;

      const ctx = canvas.current.getContext('2d');
      if (!ctx) return;
      const SIZE = Math.max(Math.floor(Math.max(canvas.current.width, canvas.current.height) * 0.015), 18);

      const heartsGraphics = [
        eurovisionRedFillBase,
        eurovisionGreenFillBase,
        eurovisionPinkFillBase,
        eurovisionBlueFillBase,
        // tinycolor('black'),
      ]
        .map((color) => color.toRgb())
        .map((color) => {
          const heartCanvas = document.createElement('canvas');
          heartCanvas.width = SIZE;
          heartCanvas.height = SIZE;
          const heartCanvasCtx = heartCanvas.getContext('2d');
          if (!heartCanvasCtx) return null;

          heartCanvasCtx.drawImage(icon, 0, 0, SIZE, SIZE);
          const imageData = heartCanvasCtx.getImageData(0, 0, SIZE, SIZE);
          for (let i = 0; i < imageData.data.length; i += 4) {
            const a = imageData.data[i + 3];

            // Apply the color to the pixel
            imageData.data[i] = color.r;
            imageData.data[i + 1] = color.g;
            imageData.data[i + 2] = color.b;
            imageData.data[i + 3] = a;
          }
          heartCanvasCtx.putImageData(imageData, 0, 0);
          return heartCanvas;
        })
        .filter((canvas) => canvas !== null);

      const width = canvas.current.width;
      const height = canvas.current.height;
      const centerX = width / 2;
      const centerY = height / 2;

      let lastUpdate = Date.now();
      let elapsedTime = 0;

      const drawHeart = (heart: HTMLCanvasElement, x: number, y: number, size: number) => {
        if (size <= 2) return;

        const destX = x + (SIZE - size) / 2;
        const destY = y + (SIZE - size) / 2;
        ctx.drawImage(heart, destX, destY, size, size);
      };
      const drawHearts = (x: number, y: number, size: number, time: number) => {
        const timeMod = (time / 2_000) % (Math.PI * 2);
        ctx.globalAlpha = Math.min(1, 4 * Math.pow(size / SIZE, 4)) * Math.min(1, time / 500);
        const distanceFromCenter = (move = 0) =>
          (1 + Math.sin((x + Math.pow(y, 0.5)) / (width / 5) + move + timeMod)) / 2;

        // red
        drawHeart(heartsGraphics[0], x, y, size);

        // blue
        const blueSizeMod = Math.pow(distanceFromCenter(), 0.5) * size;
        drawHeart(heartsGraphics[3], x, y, blueSizeMod);

        // pink
        const pinkSizeMod = Math.pow(distanceFromCenter(1), 2) * size;
        drawHeart(heartsGraphics[2], x, y, pinkSizeMod);
      };

      const update = () => {
        if (!isRunning) return;

        requestAnimationFrame(() => {
          const now = Date.now();
          const delta = now - lastUpdate;
          if (delta < 1000 / 15) {
            update();
            return;
          }
          lastUpdate = now;
          elapsedTime += delta;

          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, width, height);

          for (let x = 0; x < width; x += SIZE) {
            for (let y = 0; y < height; y += SIZE) {
              const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
              const sizeMod = Math.max(0, Math.min(1, distanceFromCenter / (width / 2)));
              const moddedSize = Math.floor(Math.pow(sizeMod, 0.5) * SIZE);

              if (moddedSize > 4) {
                drawHearts(x, y, moddedSize, elapsedTime);
              }
            }
          }

          update();
        });
      };

      update();
    };

    startAnimation();

    return () => {
      isRunning = false;
    };
  }, [size.height]);

  return <canvas ref={canvas} style={{ background: 'black' }} />;
};
