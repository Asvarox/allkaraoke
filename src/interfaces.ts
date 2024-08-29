import { typesMap } from 'modules/Songs/utils/convertTxtToSong';
import { ValuesType } from 'utility-types';

export type NoteType = ValuesType<typeof typesMap>;
export interface Note {
  start: number;
  length: number;
  pitch: number;
  type: NoteType;
  lyrics: string;
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

export type Section = NotesSection | PauseSection;

export const GAME_MODE = {
  DUEL: 'DUEL',
  PASS_THE_MIC: 'PASS_THE_MIC',
  CO_OP: 'CO_OP',
} as const;

export interface PlayerSetup {
  track: number;
  number: 0 | 1 | 2 | 3;
}

export interface SingSetup {
  id: string;
  players: PlayerSetup[];
  mode: ValuesType<typeof GAME_MODE>;
  tolerance: number;
}

export interface Song {
  local?: boolean;
  lastUpdate: string | undefined;
  author: string | undefined;
  authorUrl: string | undefined;
  genre: string | undefined;
  year: string | undefined;
  edition: string | undefined;
  language: string[];
  sourceUrl: string | undefined;
  videoGap: seconds | undefined;
  artist: string;
  artistOrigin: string | undefined;
  title: string;
  video: string;
  previewStart: number | undefined;
  previewEnd: number | undefined;
  gap: milliseconds;
  bpm: number;
  realBpm: number | undefined;
  bar: number;
  tracks: SongTrack[];
  volume: number | undefined;
  id: string;
  unsupportedProps: string[];
  mergedTrack: SongTrack;
}

export interface SongTrack {
  name?: string;
  sections: Section[];
  changes: number[];
}

export interface SongPreview extends Omit<Song, 'tracks' | 'unsupportedProps' | 'bar' | 'mergedTrack'> {
  id: string;
  tracksCount: number;
  tracks: Array<Pick<SongTrack, 'name'> & { start: number }>;
  search: string;
  isNew?: boolean;
  isDeleted?: boolean;
  local?: boolean;
  bar?: number;
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

// From https://github.com/peers/peerjs/blob/releases/2.0.0/lib/enums.ts
export enum PeerErrorType {
  BrowserIncompatible = 'browser-incompatible',
  Disconnected = 'disconnected',
  InvalidID = 'invalid-id',
  InvalidKey = 'invalid-key',
  Network = 'network',
  PeerUnavailable = 'peer-unavailable',
  SslUnavailable = 'ssl-unavailable',
  ServerError = 'server-error',
  SocketError = 'socket-error',
  SocketClosed = 'socket-closed',
  UnavailableID = 'unavailable-id',
  WebRTC = 'webrtc',
}
