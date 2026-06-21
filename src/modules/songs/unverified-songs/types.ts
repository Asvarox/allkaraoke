export type SongSourceType = 'library' | 'unverified';

export interface UnverifiedSongSearchResult {
  sharedSongId: string;
  songId: string;
  artist: string;
  title: string;
  language: string[];
  videoId: string;
}

export interface UnverifiedSongPayload extends UnverifiedSongSearchResult {
  songTxt: string;
}

export interface UnverifiedSongRatingPayload {
  feedbackType: 'ok' | 'bad';
  issues: string[];
  completionPercentage: number;
}
