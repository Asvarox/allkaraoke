import { createCanvas } from "canvas";
import { generateNote, generatePlayerNote } from "testUtilts";
import drawPlayerNote from "./playerNote";

describe('Drawing', () => {
    describe('playerNote', function () {
        const note = generateNote(1);
        const playerNote = generatePlayerNote(note, 0);

        it('Should draw a proper note when it is shorter than minimum', () => {
            const canvas = createCanvas(220, 80);
            const ctx = canvas.getContext('2d') as any as CanvasRenderingContext2D;

            drawPlayerNote(ctx, 10, 10, 10, 0, true, playerNote);
            drawPlayerNote(ctx, 50, 10, 30, 0, true, playerNote);
            drawPlayerNote(ctx, 120, 10, 50, 0, true, playerNote);

            expect(canvas.toBuffer()).toMatchImageSnapshot();
        });

        it('Should draw multiple notes', () => {
            const canvas = createCanvas(200, 200);
            const ctx = canvas.getContext('2d') as any as CanvasRenderingContext2D;

            drawPlayerNote(ctx, 10, 10, 130, 0, true, playerNote);
            drawPlayerNote(ctx, 20, 80, 130, 0, true, playerNote);

            expect(canvas.toBuffer()).toMatchImageSnapshot();
        });
    });
});
