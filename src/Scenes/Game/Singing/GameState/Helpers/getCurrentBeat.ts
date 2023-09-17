export default function getCurrentBeat(currentTime: number, beatLength: number, gap: number, round = true): number {
  const currentBeat = (currentTime - gap) / beatLength;
  return round ? Math.floor(currentBeat) : currentBeat;
}
