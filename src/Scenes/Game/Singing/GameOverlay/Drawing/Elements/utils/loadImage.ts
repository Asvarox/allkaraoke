export default function loadImage(path: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.src = path;
    });
}
