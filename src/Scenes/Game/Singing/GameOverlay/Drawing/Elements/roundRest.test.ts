import { createCanvas } from 'canvas';
import roundRect from './roundRect';

describe('Drawing', () => {
    describe('roundRect', function () {
        it('Should draw a round rect', () => {
            const canvas = createCanvas(100, 100);

            const ctx = canvas.getContext('2d');

            ctx.fillStyle = 'red';
            ctx.strokeStyle = 'blue';
            roundRect(ctx, 10, 10, 30, 25, 100, true, true);

            expect(canvas.toBuffer()).toMatchImageSnapshot();
        });
    });
});
