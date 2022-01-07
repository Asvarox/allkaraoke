const MIDDLEA = 440;
const SEMITONE = 69;

export const pitchFromFrequency = (freq: number) =>
    Math.round(12 * (Math.log(freq / MIDDLEA) / Math.log(2))) + SEMITONE;

export const calcDistanceBetweenPitches = (note: number, targetNote: number) => {
    const tolerance = 1;
    const noteDistance = ((note - targetNote + 6) % 12) - 6;

    return Math.abs(noteDistance) <= tolerance ? 0 : noteDistance;
};

export const calcDistance = (frequency: number, targetNote: number) => {
    const note = pitchFromFrequency(frequency);

    return calcDistanceBetweenPitches(note, targetNote);
};
