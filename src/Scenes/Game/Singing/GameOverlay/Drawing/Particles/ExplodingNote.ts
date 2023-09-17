import { Note } from 'interfaces';
import tinycolor from 'tinycolor2';
import ParticleManager from '../ParticleManager';
import Particle from '../interfaces';
import styles from '../styles';
import TriangleParticle from './Triangle';

export default class ExplodingNoteParticle implements Particle {
  public finished = true;

  constructor(
    x: number,
    y: number,
    width: number,
    playerNumber: number,
    note: Note,
    particleManager: typeof ParticleManager,
  ) {
    const color =
      note.type === 'star'
        ? styles.colors.players[playerNumber].star.fill
        : styles.colors.players[playerNumber].perfect.fill;

    const lightColor = tinycolor(color).lighten(15).toRgbString();
    const darkColor = tinycolor(color).darken(15).toRgbString();

    const density = width / 6;
    for (let i = 0; i < density; i++) {
      const rand = Math.random();
      let finalColor = color;
      if (rand > 0.66) finalColor = lightColor;
      else if (rand > 0.33) finalColor = darkColor;

      const finalY = y + 20 * (Math.random() - 0.5);

      particleManager.add(new TriangleParticle(x + i * 5, finalY, finalColor, (density - i) / 10));
    }
  }
  public tick = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {};
}
