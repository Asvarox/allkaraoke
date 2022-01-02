const MIDDLEA = 440;
const SEMITONE = 69;

export const noteFromFreq = (freq: number) => Math.round(12 * (Math.log(freq / MIDDLEA) / Math.log(2))) + SEMITONE;


export const calcDistanceBetweenNotes = (note: number, targetNote: number) => {
    const tolerance = 1;
    const noteDistance = (((note % 12) - (targetNote % 12) + 6) % 12) - 6;
    const toleratedDistance = Math.max(0, Math.abs(noteDistance) - tolerance) * Math.sign(noteDistance);

    return toleratedDistance;
};

export const calcDistance = (frequency: number, targetNote: number) => {
    const note = noteFromFreq(frequency);
    
    return calcDistanceBetweenNotes(note, targetNote);
};
