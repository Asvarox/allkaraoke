export interface Note {
    start: number;
    length: number;
    pitch: number;
    type: 'normal' | 'star' | string;
    lyrics: string;
}

export type NoLyricNote = Omit<Note, 'lyrics' | 'type'>;

export type Section = NotesSection | PauseSection;

export interface NotesSection {
    // end: never;
    start: number;
    notes: Note[];
    type: 'notes';
}

export interface PauseSection {
    start: number;
    end: number;
    // notes: never;
    type: 'pause';
}

export interface Song {
    author?: string;
    authorUrl?: string;
    genre?: string;
    year?: string;
    edition?: string;
    language?: string;
    sourceUrl?: string;
    videoGap?: number;
    artist: string;
    title: string;
    video: string;
    previewStart?: number,
    previewEnd?: number,
    gap: number;
    bpm: number;
    bar: number;
    tracks: SongTrack[];
}

export interface SongTrack {
    name?: string,
    sections: Section[];
}

export interface SongPreview extends Pick<Song, 'artist' | 'title' | 'video' | 'previewStart' | 'previewEnd' | 'videoGap'> {
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
    isPerfect: boolean,
}


type UndefinedKeys<T> = {
    [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T]

export type ExtractOptional<T> = Pick<T, Exclude<UndefinedKeys<T>, undefined>>