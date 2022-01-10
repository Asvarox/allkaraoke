export default function getCurrentBeat(currentTime: number, beatLength: number, gap: number): number {
    return Math.floor((currentTime - gap) / beatLength);
}
