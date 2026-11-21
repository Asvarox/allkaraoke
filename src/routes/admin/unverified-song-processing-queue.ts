import { getPendingAdminUnverifiedSongSaveIds } from './background-song-save';
import { AdminReviewReason, AdminReviewSong } from './unverified-songs-admin-api';
import { getAdminSongsVerifiedToday } from './verified-songs-counter';

const adminEditSongPath = 'edit/song/';

const OLDEST_SONG_WEIGHT = 3;
const NEWEST_SONG_WEIGHT = 1;

// The queue drains these pools in order - a pool is only drawn from once all the previous ones are empty
const REVIEW_POOLS: AdminReviewReason[][] = [
  ['unverified'],
  ['not-in-sync', 'duration-shift'],
  ['too-loud', 'too-quiet'],
];

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

export const getRandomAdminReviewSong = (
  songs: AdminReviewSong[],
  currentKey?: string,
): AdminReviewSong | undefined => {
  // Processed songs stay in KV until the nightly import removes them, so skip the ones already processed.
  const processedKeys = new Set([...getAdminSongsVerifiedToday(), ...getPendingAdminUnverifiedSongSaveIds()]);
  const candidates = songs.filter((song) => song.key !== currentKey && !processedKeys.has(song.key));

  for (const pool of REVIEW_POOLS) {
    const poolCandidates = candidates.filter((song) => song.reasons.some((reason) => pool.includes(reason)));

    if (poolCandidates.length > 0) return pickWeighted(poolCandidates);
  }

  return undefined;
};

export const buildAdminReviewSongProcessingUrl = (
  song: Pick<AdminReviewSong, 'songId' | 'sharedSongId'>,
  processQueue = false,
) => {
  const searchParams = new URLSearchParams(
    song.sharedSongId ? { externalSong: song.sharedSongId } : { song: song.songId },
  );
  searchParams.set('admin', 'true');
  searchParams.set('step', 'sync');

  if (processQueue) {
    searchParams.set('processQueue', 'true');
  }

  return `${adminEditSongPath}?${searchParams.toString()}`;
};

export const getNextAdminReviewSongProcessingUrl = (songs: AdminReviewSong[], currentKey: string) => {
  const nextSong = getRandomAdminReviewSong(songs, currentKey);

  return nextSong ? buildAdminReviewSongProcessingUrl(nextSong, true) : 'admin/';
};
