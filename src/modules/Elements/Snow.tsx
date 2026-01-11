import { useEffect, useRef } from 'react';
import useViewportSize from '~/modules/hooks/useViewportSize';

interface Snowflake {
  x: number;
  y: number;
  opacity: number;
  radius: number;
  color: string;
  speed: number;
  sway: number;
}

const NUMBER_OF_SNOWFLAKES = 45;
const MAX_SNOWFLAKE_SIZE = 7;
const MAX_SNOWFLAKE_SPEED = 0.005;
const SNOWFLAKE_COLOUR = '#ddd';
const snowflakes: Snowflake[] = [];

// from https://codepen.io/codebubb/pen/LYqovoV
export default function Snow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');

    const createSnowflake = (yRatio = 1): Snowflake => ({
      x: Math.random() * canvas.width,
      y: (Math.random() / yRatio) * canvas.height,
      opacity: 0,
      radius: Math.floor(Math.random() * MAX_SNOWFLAKE_SIZE) + 1,
      color: SNOWFLAKE_COLOUR,
      speed: Math.random() * MAX_SNOWFLAKE_SPEED + 1,
      sway: Math.random() - 0.5, // next
    });

    const drawSnowflake = (snowflake: Snowflake) => {
      if (!ctx) {
        return;
      }
      ctx.beginPath();
      ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
      ctx.globalAlpha = snowflake.opacity;
      ctx.fillStyle = snowflake.color;
      ctx.fill();
      ctx.closePath();
      ctx.globalAlpha = 1;
    };

    const updateSnowflake = (snowflake: Snowflake) => {
      snowflake.y += snowflake.speed;
      snowflake.opacity = Math.min(1, snowflake.opacity + snowflake.speed - 1);
      snowflake.x += snowflake.sway; // next
      if (snowflake.y > canvas.height) {
        Object.assign(snowflake, createSnowflake(1));
      }
    };

    let active = true;
    const animate = () => {
      if (ctx === null) {
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakes.forEach((snowflake) => {
        updateSnowflake(snowflake);
        drawSnowflake(snowflake);
      });

      if (active) {
        requestAnimationFrame(animate);
      }
    };

    for (let i = 0; i < NUMBER_OF_SNOWFLAKES; i++) {
      snowflakes.push(createSnowflake());
    }

    animate();
    return () => {
      active = false;
    };
  }, []);

  const { width, height } = useViewportSize();
  return <canvas ref={canvasRef} width={width} height={height} />;
}
