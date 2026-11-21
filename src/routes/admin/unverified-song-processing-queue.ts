import { getPendingAdminUnverifiedSongSaveIds } from './background-song-save';
import { AdminReviewReason, AdminReviewSong } from './unverified-songs-admin-api';
import { getAdminSongsVerifiedToday } from './verified-songs-counter';

const adminEditSongPath = 'edit/song/';

const OLDEST_SONG_WEIGHT = 3;
const NEWEST_SONG_WEIGHT = 1;

export type AdminReviewQueue = 'unverified' | 'reports';

// Each queue drains its pools in order - a pool is only drawn from once all the previous ones are empty
const REVIEW_POOLS: Record<AdminReviewQueue, AdminReviewReason[][]> = {
  unverified: [['unverified']],
  reports: [['not-in-sync'], ['too-loud', 'too-quiet']],
};

export const parseAdminReviewQueue = (value: string | null): AdminReviewQueue | null =>
  value === 'reports' ? 'reports' : value === 'unverified' || value === 'true' ? 'unverified' : null;

const getSubmissionAgeWeight = (song: AdminReviewSong, oldestFirstSeenAt: number, newestFirstSeenAt: number) => {
  if (oldestFirstSeenAt === newestFirstSeenAt) return OLDEST_SONG_WEIGHT;

  const age = (newestFirstSeenAt - (song.firstSeenAt ?? newestFirstSeenAt)) / (newestFirstSeenAt - oldestFirstSeenAt);

  return NEWEST_SONG_WEIGHT + age * (OLDEST_SONG_WEIGHT - NEWEST_SONG_WEIGHT);
};

const pickWeighted = (candidates: AdminReviewSong[]) => {
  const firstSeenAtValues = candidates.map((song) => song.firstSeenAt ?? 0);
  const oldestFirstSeenAt = Math.min(...firstSeenAtValues);
  const newestFirstSeenAt = Math.max(...firstSeenAtValues);
  const weights = candidates.map((song) => getSubmissionAgeWeight(song, oldestFirstSeenAt, newestFirstSeenAt));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  let pick = Math.random() * totalWeight;

  for (let index = 0; index < candidates.length; index += 1) {
    pick -= weights[index];

    if (pick < 0) return candidates[index];
  }

  return candidates[candidates.length - 1];
};

// Processed songs stay in KV until the nightly import removes them, so skip the ones already processed.
const getUnprocessedSongs = (songs: AdminReviewSong[], currentKey?: string) => {
  const processedKeys = new Set([...getAdminSongsVerifiedToday(), ...getPendingAdminUnverifiedSongSaveIds()]);
  return songs.filter((song) => song.key !== currentKey && !processedKeys.has(song.key));
};

/** How many songs the queue can still pick from */
export const countAdminReviewQueueSongs = (songs: AdminReviewSong[], queue: AdminReviewQueue) =>
  getUnprocessedSongs(songs).filter((song) =>
    song.reasons.some((reason) => REVIEW_POOLS[queue].flat().includes(reason)),
  ).length;

export const getRandomAdminReviewSong = (
  songs: AdminReviewSong[],
  queue: AdminReviewQueue,
  currentKey?: string,
): AdminReviewSong | undefined => {
  const candidates = getUnprocessedSongs(songs, currentKey);

  for (const pool of REVIEW_POOLS[queue]) {
    const poolCandidates = candidates.filter((song) => song.reasons.some((reason) => pool.includes(reason)));

    if (poolCandidates.length > 0) return pickWeighted(poolCandidates);
  }

  return undefined;
};

export const buildAdminReviewSongProcessingUrl = (
  song: Pick<AdminReviewSong, 'songId' | 'sharedSongId'>,
  queue?: AdminReviewQueue,
) => {
  const searchParams = new URLSearchParams(
    song.sharedSongId ? { externalSong: song.sharedSongId } : { song: song.songId },
  );
  searchParams.set('admin', 'true');
  searchParams.set('step', 'sync');

  if (queue) {
    searchParams.set('processQueue', queue);
  }

  return `${adminEditSongPath}?${searchParams.toString()}`;
};

export const getNextAdminReviewSongProcessingUrl = (
  songs: AdminReviewSong[],
  queue: AdminReviewQueue,
  currentKey: string,
) => {
  const nextSong = getRandomAdminReviewSong(songs, queue, currentKey);

  return nextSong ? buildAdminReviewSongProcessingUrl(nextSong, queue) : 'admin/';
};
