import { range } from 'lodash';
import { FrequencyRecord, Note, PlayerNote, Section, Song } from './interfaces';

export const generateNote = (start: number, length = 1, data: Partial<Note> = {}): Note => ({
    start,
    length,
    type: 'normal',
    lyrics: 'test',
    pitch: 5,
    ...data,
});

export const generatePlayerNote = (
    note: Note,
    distance: number,
    startOffest: number = 0,
    length: number = 1,
    isPerfect = false,
    vibrato = false,
    frequencyRecords: FrequencyRecord[] = [],
): PlayerNote => ({
    start: note.start + startOffest,
    length,
    distance,
    note,
    isPerfect,
    vibrato,
    frequencyRecords,
});

export const generateSong = (tracks: Section[][], data: Partial<Song> = {}): Song => ({
    artist: 'artistTest',
    title: 'titleTest',
    video: 'videoTest',
    gap: 0,
    bpm: 60, // makes it easy to calc - beatLength = 1ms
    bar: 1000, // makes it easy to calc - beatLength = 1ms
    tracks: tracks.map((sections) => ({ sections })),
    ...data,
});

export const generateSection = (start: number, length: number, notesCount: number): Section => ({
    type: 'notes',
    start,
    notes: range(notesCount).map((val) => generateNote(start + val, 1)),
});
