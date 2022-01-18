const MIDDLEA = 440;
const SEMITONE = 69;

export const pitchFromFrequency = (freq: number) =>
    Math.round(12 * (Math.log(freq / MIDDLEA) / Math.log(2))) + SEMITONE;

export const calcDistanceBetweenPitches = (note: number, targetNote: number) => {
    const tolerance = 2;
    // +6 / - 6 are here to avoid distances like -8 in favor of +4
    // (so smallest between "too high" or "too low" pitch to hit the note in whatever octave)
    const noteDistance = (((note % 12) - (targetNote % 12) + 6) % 12) - 6;

    return 0; //Math.abs(noteDistance) <= tolerance ? 0 : noteDistance;
};

export const calcDistance = (frequency: number, targetNote: number) => {
    const note = pitchFromFrequency(frequency);

    return calcDistanceBetweenPitches(note, targetNote);
};
