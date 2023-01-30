import { ValuesType } from 'utility-types';

export type NoteType = 'normal' | 'star' | 'freestyle' | 'rap';
export interface Note {
    start: number;
    length: number;
    pitch: number;
    type: NoteType;
    lyrics: string;
}

export type Section = NotesSection | PauseSection;

export const GAME_MODE = {
    DUEL: 'DUEL',
    PASS_THE_MIC: 'PASS_THE_MIC',
} as const;

export interface PlayerSetup {
    name: string;
    track: number;
}

export interface SingSetup {
    id: string;
    players: [PlayerSetup, PlayerSetup];
    mode: ValuesType<typeof GAME_MODE>;
    tolerance: number;
}

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
    lastUpdate: string | undefined;
    author: string | undefined;
    authorUrl: string | undefined;
    genre: string | undefined;
    year: string | undefined;
    edition: string | undefined;
    language: string | undefined;
    sourceUrl: string | undefined;
    videoGap: number | undefined;
    artist: string;
    title: string;
    video: string;
    previewStart: number | undefined;
    previewEnd: number | undefined;
    gap: number;
    bpm: number;
    realBpm: number | undefined;
    bar: number;
    tracks: SongTrack[];
    volume: number | undefined;
}

export interface SongTrack {
    name?: string;
    sections: Section[];
}

export interface SongPreview extends Omit<Song, 'tracks'> {
    file: string;
    tracksCount: number;
    tracks: Array<Pick<SongTrack, 'name'> & { start: number }>;
    search: string;
    isNew?: boolean;
}

export interface FrequencyRecord {
    timestamp: number;
    frequency: number;
}

export interface NoteFrequencyRecord extends FrequencyRecord {
    preciseDistance: number;
}

export interface PlayerNote {
    start: number;
    length: number;
    distance: number;
    note: Note;
    isPerfect: boolean;
    vibrato: boolean;
    frequencyRecords: NoteFrequencyRecord[];
}

type UndefinedKeys<T> = {
    [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

export type ExtractOptional<T> = Pick<T, Exclude<UndefinedKeys<T>, undefined>>;

export type DetailedScore = Record<Note['type'] | 'perfect' | 'vibrato', number>;

export interface HighScoreEntity {
    singSetupId: string;
    name: string;
    score: number;
    date: string;
}

export type seconds = number;
export type milliseconds = number;
