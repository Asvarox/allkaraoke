import { milliseconds, songBeat } from '../../../../interfaces';

export default function getCurrentBeat(
  currentTime: milliseconds,
  beatLength: number,
  gap: milliseconds,
  round = true,
): songBeat {
  const currentBeat = (currentTime - gap) / beatLength;
  return round ? Math.floor(currentBeat) : currentBeat;
}
