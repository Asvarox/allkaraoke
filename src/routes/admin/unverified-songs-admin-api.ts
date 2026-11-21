import { Song } from '~/interfaces';
import convertSongToTxt from '~/modules/songs/utils/convert-song-to-txt';

import { getAdminPassword } from './admin-password';

export interface AdminUnverifiedSong {
  sharedSongId: string;
  songId: string;
  artist: string;
  title: string;
  language: string[];
  videoId: string;
  firstSeenAt: number;
  updated: number;
}

class AdminUnverifiedSongsApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

const assertOk = async (response: Response) => {
  if (response.ok) {
    return;
  }

  const payload = await response.json().catch(() => null);
  const message =
    payload && typeof payload === 'object' && 'error' in payload ? String(payload.error) : response.statusText;

  throw new AdminUnverifiedSongsApiError(message, response.status);
};

const adminHeaders = (password: string) => ({
  'x-admin-panel-password': password,
});

export const listAdminUnverifiedSongs = async (password: string) => {
  const response = await fetch('/admin/unverified-songs', {
    headers: adminHeaders(password),
  });
  await assertOk(response);

  return response.json() as Promise<AdminUnverifiedSong[]>;
};

export const deleteAdminUnverifiedSong = async (password: string, sharedSongId: string) => {
  const url = new URL('/admin/unverified-songs', window.location.origin);
  url.searchParams.set('id', sharedSongId);
  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: adminHeaders(password),
  });
  await assertOk(response);
};

export const regenerateAdminUnverifiedSongsIndex = async (password: string) => {
  const response = await fetch('/admin/unverified-songs', {
    method: 'PUT',
    headers: adminHeaders(password),
  });
  await assertOk(response);
};

export const updateAdminUnverifiedSong = async (sharedSongId: string, song: Song) => {
  const password = getAdminPassword();
  const url = new URL('/admin/unverified-song', window.location.origin);
  url.searchParams.set('id', sharedSongId);
  const response = await fetch(url.toString(), {
    method: 'PUT',
    headers: {
      ...adminHeaders(password),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      songId: song.id,
      songTxt: convertSongToTxt(song),
      artist: song.artist,
      title: song.title,
      language: song.language,
      videoId: song.video,
    }),
  });
  await assertOk(response);
};

export type SongQualityIssue = 'not-in-sync' | 'too-loud' | 'too-quiet' | 'duration-shift';

export interface DurationShiftDetails {
  previousDuration: number;
  currentDuration: number;
  offset: number | null;
  detectedAt: number;
  note?: string;
}

export interface AdminSongQualityFlag {
  songId: string;
  artist: string;
  title: string;
  language: string[];
  videoId: string;
  issues: SongQualityIssue[];
  reportCounts: Partial<Record<SongQualityIssue, number>>;
  players: number;
  durationShift?: DurationShiftDetails;
}

const formatSeconds = (value: number) => `${Math.round(value * 100) / 100}s`;

export const describeDurationShift = ({ previousDuration, currentDuration, offset, note }: DurationShiftDetails) =>
  [
    `Video length changed ${formatSeconds(previousDuration)} -> ${formatSeconds(currentDuration)}`,
    offset === null ? 'no consistent offset found' : `detected offset ${offset > 0 ? '+' : ''}${formatSeconds(offset)}`,
    note,
  ]
    .filter(Boolean)
    .join(', ');

export const listAdminSongQualityFlags = async (password: string) => {
  const response = await fetch('/admin/song-quality-flags', {
    headers: adminHeaders(password),
  });
  await assertOk(response);

  return response.json() as Promise<{ generatedAt: number; songs: AdminSongQualityFlag[] }>;
};

export const deleteAdminSongQualityFlag = async (password: string, songId: string) => {
  const url = new URL('/admin/song-quality-flags', window.location.origin);
  url.searchParams.set('id', songId);
  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: adminHeaders(password),
  });
  // Already gone (e.g. replaced by the weekly job) - nothing left to dismiss
  if (response.status === 404) return;
  await assertOk(response);
};

export type AdminReviewReason = 'unverified' | SongQualityIssue;

/** A song waiting for admin review - either an unverified (shared) song or a library song reported by players. */
export interface AdminReviewSong {
  /** sharedSongId for unverified songs, songId for reported library songs */
  key: string;
  songId: string;
  artist: string;
  title: string;
  language: string[];
  videoId: string;
  reasons: AdminReviewReason[];
  /** Set only for unverified songs */
  sharedSongId?: string;
  firstSeenAt?: number;
  updated?: number;
  reportCounts?: AdminSongQualityFlag['reportCounts'];
  players?: number;
  durationShift?: DurationShiftDetails;
}

export const toAdminReviewSongs = (
  unverifiedSongs: AdminUnverifiedSong[],
  flags: AdminSongQualityFlag[],
): AdminReviewSong[] => {
  const unverified: AdminReviewSong[] = unverifiedSongs.map((song) => ({
    ...song,
    key: song.sharedSongId,
    reasons: ['unverified'],
  }));
  const reported = flags.flatMap((flag): AdminReviewSong[] => {
    const unverifiedSong = unverified.find((song) => song.songId === flag.songId);
    if (unverifiedSong) {
      unverifiedSong.reasons.push(...flag.issues);
      unverifiedSong.reportCounts = flag.reportCounts;
      unverifiedSong.players = flag.players;
      unverifiedSong.durationShift = flag.durationShift;
      return [];
    }

    return [
      {
        key: flag.songId,
        songId: flag.songId,
        artist: flag.artist,
        title: flag.title,
        language: flag.language,
        videoId: flag.videoId,
        reasons: flag.issues,
        reportCounts: flag.reportCounts,
        players: flag.players,
        durationShift: flag.durationShift,
      },
    ];
  });

  return [...unverified, ...reported];
};

export const listAdminReviewSongs = async (password: string) => {
  const [unverifiedSongs, flags] = await Promise.all([
    listAdminUnverifiedSongs(password),
    listAdminSongQualityFlags(password),
  ]);

  return toAdminReviewSongs(unverifiedSongs, flags.songs);
};

export const ADMIN_REVIEW_SONGS_SWR_KEY = 'admin-review-songs';
