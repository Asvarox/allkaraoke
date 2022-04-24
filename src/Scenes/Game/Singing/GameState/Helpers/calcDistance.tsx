import { MIDDLEA, SEMITONE } from 'consts';
import pitchToFrequency from 'utils/pitchToFrequency';
import GameState from '../GameState';

export const pitchFromFrequency = (freq: number) =>
    Math.round(12 * (Math.log(freq / MIDDLEA) / Math.log(2))) + SEMITONE;

const getDistanceInCents = (noteFreq: number, freq: number) =>
    Math.floor((1200 * Math.log(freq / noteFreq)) / Math.log(2));

const getCentDistance = (targetNote: number, freq: number, tolerance: number) => {
    const noteFreq = pitchToFrequency(targetNote);
    const cents = getDistanceInCents(noteFreq, freq);
    // To handle cases for cents like -1150 (=50) or 1150 (=-50)
    const distance = Math.sign(cents) * ((((Math.abs(cents) % 1200) + 600) % 1200) - 600);

    return distance / (tolerance * 100 + 50);
};

export const calcDistanceBetweenPitches = (note: number, targetNote: number, tolerance: number) => {
    // +6 / - 6 are here to avoid distances like -8 in favor of +4
    // (so smallest between "too high" or "too low" pitch to hit the note in whatever octave)
    const noteDistance = (((note % 12) - (targetNote % 12) + 18) % 12) - 6;

    return Math.abs(noteDistance) <= tolerance ? 0 : noteDistance;
};

export const calcDistance = (frequency: number, targetNote: number) => {
    const tolerance = GameState.getTolerance();
    const note = pitchFromFrequency(frequency);
    let preciseDistance: number = -1;
    const distance = calcDistanceBetweenPitches(note, targetNote, tolerance);

    if (distance === 0) {
        preciseDistance = getCentDistance(targetNote, frequency, tolerance);
    }

    return { distance, preciseDistance };
};
