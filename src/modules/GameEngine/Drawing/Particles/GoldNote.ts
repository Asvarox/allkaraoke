import GoldTriangle from 'modules/GameEngine/Drawing/Particles/GoldTriangle';
import { randomInt } from 'modules/utils/randomValue';
import tinycolor from 'tinycolor2';
import ParticleManager from '../ParticleManager';
import Particle from '../interfaces';
import styles from '../styles';

export default class GoldNoteParticle implements Particle {
  public finished = true;

  constructor(
    x: number,
    y: number,
    width: number,
    playerNumber: 0 | 1 | 2 | 3,
    particleManager: typeof ParticleManager,
  ) {
    const color = styles.colors.players[playerNumber].starPerfect.fill;

    const lightColor = tinycolor(color).lighten(15).toRgbString();
    const darkColor = tinycolor(color).darken(15).toRgbString();

    if (Math.random() > 0.9) {
      const position = randomInt(0, width / 8);

      const rand = Math.random();
      let finalColor = color;
      if (rand > 0.66) finalColor = lightColor;
      else if (rand > 0.33) finalColor = darkColor;

      const finalY = y + 20 * (Math.random() - 0.5);

      particleManager.add(new GoldTriangle(x + position * 8, finalY, finalColor));
    }
  }
  public tick = () => {};
}
