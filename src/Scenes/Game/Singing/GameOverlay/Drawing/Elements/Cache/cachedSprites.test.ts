import { Canvas, createCanvas } from "canvas";
import { drawSprite, getSprite } from "Scenes/Game/Singing/GameOverlay/Drawing/Elements/Cache/cachedSprites";
//
// jest.mock('./utils/createCanvas', () => ({
//     __esModule: true,
//     default: (w: number, h: number) => {
//         const canvas = require('canvas');
//
//         return canvas.createCanvas(w, h);
//     },
// }));

describe('Drawing', () => {
    describe('cachedSprites', function () {
        it('Should draw a proper sprite map', () => {
            const { canvas } = getSprite('redMiss', 'start');

            expect((canvas as any as Canvas).toBuffer()).toMatchImageSnapshot();
        });
        it('Should return proper coordinates to draw a legit note', () => {
            const canvas = createCanvas(100, 100);
            const ctx = canvas.getContext('2d') as any as CanvasRenderingContext2D;

            const start = drawSprite(ctx, 'blueHit', 'start', 10, 10);
            drawSprite(ctx, 'blueHit', 'middle', 10 + start.w, 10, 40);
            drawSprite(ctx, 'blueHit', 'end', 10 + start.w + 40, 10);

            expect(canvas.toBuffer()).toMatchImageSnapshot();
        });
        it('Should return proper coordinates to draw a legit small note', () => {
            const canvas = createCanvas(100, 100);
            const ctx = canvas.getContext('2d') as any as CanvasRenderingContext2D;

            const start = drawSprite(ctx, 'blueMiss', 'start', 10, 10);
            drawSprite(ctx, 'blueMiss', 'middle', 10 + start.w, 10, 40);
            drawSprite(ctx, 'blueMiss', 'end', 10 + start.w + 40, 10);

            expect(canvas.toBuffer()).toMatchImageSnapshot();
        });
    });
});
