import { Note } from 'interfaces';
import Particle from '../interfaces';
import ParticleManager from '../ParticleManager';
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

        const density = width / 6;
        for (let i = 0; i < density; i++) {
            particleManager.add(new TriangleParticle(x + i * 5, y, color, (density - i) / 10));
        }
    }
    public tick = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {};
}
