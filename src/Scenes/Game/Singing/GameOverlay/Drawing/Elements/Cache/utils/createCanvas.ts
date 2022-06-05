// In tests this function is mocked so it creates node-canvas object
export default function createCanvas(w: number, h: number) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    return canvas;
}
