export type SongSourceType = 'library' | 'shared';

export interface SharedSongSearchResult {
  externalSongId: string;
  songId: string;
  artist: string;
  title: string;
  language: string[];
  videoId: string;
}

export interface SharedSongPayload extends SharedSongSearchResult {
  songTxt: string;
}

export interface SharedSongRatingPayload {
  feedbackType: 'ok' | 'bad';
  issues: string[];
  completionPercentage: number;
}
