import { MIDDLEA, SEMITONE } from 'consts';

export default function pitchToFrequency(note: number) {
  return MIDDLEA * Math.pow(2, (note - SEMITONE) / 12);
}
