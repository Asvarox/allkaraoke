export interface Note {
    start: number,
    length: number,
    pitch: number,
    type: 'normal' | 'star' | string,
    lyrics: string,
}

export interface Section {
    start: number,
    notes: Note[],
}

export interface Song {
    artist: string,
    title: string,
    video: string,
    gap: number,
    bpm: number,
    bar: number,
    sections: Section[],
}

export interface PitchRecord {
    timestamp: number,
    pitch: number,
}