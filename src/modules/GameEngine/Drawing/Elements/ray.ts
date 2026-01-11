import tinycolor from 'tinycolor2';
import { randomInt } from '~/modules/utils/randomValue';

const cachedColors: Record<string, [string[], string[], string[]]> = {};

const getColors = (color: string) => {
  if (!cachedColors[color]) {
    const c = tinycolor(color);
    cachedColors[color] = [
      [c.setAlpha(0.8).toRgbString(), c.setAlpha(0.9).toRgbString(), c.setAlpha(1).toRgbString()],
      [c.setAlpha(0).toRgbString()],
      [c.setAlpha(0.1).toRgbString(), c.setAlpha(0.3).toRgbString(), c.setAlpha(0.2).toRgbString()],
    ];
  }

  return cachedColors[color];
};

console.log('cachedColors', cachedColors);

export default function ray(
  _canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  _height: number,
  color: string | any,
  alpha: number = 1,
) {
  if (width <= 0) return;

  ctx.globalAlpha = alpha;
  try {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, width / 2);
    const [cFirst, cLast, c0] = getColors(color);
    gradient.addColorStop(0, cFirst[randomInt(0, cFirst.length - 1)]);
    gradient.addColorStop(0.05, cFirst[randomInt(0, cFirst.length - 1)]);
    gradient.addColorStop(0.15, c0[randomInt(0, c0.length - 1)]);
    gradient.addColorStop(1, cLast[randomInt(0, cLast.length - 1)]);
    ctx.beginPath();
    ctx.arc(x, y, width / 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.fillStyle = color;
    ctx.globalAlpha = 1;
  } catch (e) {
    console.log('error', e, x, y, 0, x, y, width / 2);
    throw e;
  }
}
