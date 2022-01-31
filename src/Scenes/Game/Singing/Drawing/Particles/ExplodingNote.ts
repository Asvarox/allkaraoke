import { Note } from '../../../../../interfaces';
import Particle from '../interfaces';
import ParticleManager from '../ParticleManager';
import styles from '../styles';
import TriangleParticle from './Triangle';

export default class ExplodingNoteParticle implements Particle {
    public finished = true;

    constructor(
        private x: number,
        private y: number,
        width: number,
        playerNumber: number,
        note: Note,
        particleManager: typeof ParticleManager,
    ) {
        const color =
            note.type === 'star'
                ? styles.colors.players[playerNumber].star.fill
                : styles.colors.players[playerNumber].perfect.fill;
        for (let i = 0; i < width / 4; i++) {
            particleManager.add(new TriangleParticle(x + i * 4, y, color));
        }
    }
    public tick = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {};
}
