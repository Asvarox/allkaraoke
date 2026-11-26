const legacyEnvNames = {
  UNVERIFIED_SONGS_ADMIN_URL: 'SHARED_SONGS_ADMIN_URL',
  UNVERIFIED_SONGS_ADMIN_TOKEN: 'SHARED_SONGS_ADMIN_TOKEN',
} as const;

const getRequiredEnv = (name: keyof typeof legacyEnvNames) => {
  const value = process.env[name] ?? process.env[legacyEnvNames[name]];
  if (!value) {
    throw new Error(`Missing required env variable: ${name} or ${legacyEnvNames[name]}`);
  }
  return value;
};

export const isUnverifiedSongsAdminConfigured = () =>
  !!(process.env.UNVERIFIED_SONGS_ADMIN_URL ?? process.env.SHARED_SONGS_ADMIN_URL) &&
  !!(process.env.UNVERIFIED_SONGS_ADMIN_TOKEN ?? process.env.SHARED_SONGS_ADMIN_TOKEN);

const requestUnverifiedSongsAdmin = async (path: string, options: RequestInit) => {
  const baseUrl = getRequiredEnv('UNVERIFIED_SONGS_ADMIN_URL');
  const token = getRequiredEnv('UNVERIFIED_SONGS_ADMIN_TOKEN');
  const url = new URL(path, baseUrl);

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
      'x-unverified-songs-admin-token': token,
    },
  });

  if (!response.ok) {
    throw new Error(`Unverified songs admin request failed (${url} ${response.status}): ${await response.text()}`);
  }

  return response;
};

export interface UnverifiedSongRecord {
  sharedSongId: string;
  songId: string;
  songTxt: string;
  artist: string;
  title: string;
  language: string[];
  videoId: string;
  validatedAt: number;
  firstSeenAt: number;
  updated: number;
  lastSeenAt: number;
  sourceUserId: string;
  sourceEventAt: number;
}

export const upsertUnverifiedSongRecord = async (record: UnverifiedSongRecord) => {
  await requestUnverifiedSongsAdmin('/unverified-songs-admin', {
    method: 'POST',
    body: JSON.stringify(record),
  });
};

export const removeUnverifiedSongRecord = async (sharedSongId: string) => {
  const encodedSongId = encodeURIComponent(sharedSongId);
  await requestUnverifiedSongsAdmin(`/unverified-songs-admin?id=${encodedSongId}`, {
    method: 'DELETE',
  });
};

import type { SongVersion } from '../../src/modules/songs/song-version';
import type { SongQualityIssue } from './song-quality-scoring';

export interface SongQualityFlag {
  songId: string;
  /** Missing means the original */
  version?: SongVersion;
  artist: string;
  title: string;
  language: string[];
  videoId: string;
  issues: SongQualityIssue[];
  /** Distinct players who reported each issue */
  reportCounts: Partial<Record<SongQualityIssue, number>>;
  /** Distinct players of the current version */
  players: number;
}

/** Replaces the player-report flags, duration-shift flags stay */
export const replaceSongQualityFlags = async (songs: SongQualityFlag[]) => {
  await requestUnverifiedSongsAdmin('/song-quality-flags-admin', {
    method: 'PUT',
    body: JSON.stringify({ songs }),
  });
};

/** Flag key (see getSongVersionKey) -> when its reports were last dismissed (ms) */
export const getSongQualityDismissals = async (): Promise<Record<string, number>> => {
  const response = await requestUnverifiedSongsAdmin('/song-quality-flags-admin', { method: 'GET' });
  const body = (await response.json()) as { dismissals?: Record<string, number> };

  return body.dismissals ?? {};
};

export const regenerateUnverifiedSongIndex = async () => {
  await requestUnverifiedSongsAdmin('/unverified-songs-admin', {
    method: 'PUT',
  });
};
