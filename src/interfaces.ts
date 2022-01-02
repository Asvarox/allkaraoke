export interface Note {
    start: number;
    length: number;
    pitch: number;
    type: 'normal' | 'star' | string;
    lyrics: string;
}

export type NoLyricNote = Omit<Note, 'lyrics' | 'type'>;

export interface Section {
    start: number;
    notes: Note[];
}

export interface Song {
    artist: string;
    title: string;
    video: string;
    previewStart: number,
    gap: number;
    bpm: number;
    bar: number;
    sections: Section[];
}
export interface SongPreview extends Pick<Song, 'artist' | 'title' | 'video' | 'previewStart'> {
    file: string,
}

export interface PitchRecord {
    timestamp: number;
    pitch: number;
}

export interface RelativeLine {
    start: number,
    length: number,
    distance: number,
    note: Note,
}
