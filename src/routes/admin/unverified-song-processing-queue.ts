import { AdminUnverifiedSong } from './unverified-songs-admin-api';

const adminEditSongPath = 'edit/song/';

const OLDEST_SONG_WEIGHT = 3;
const NEWEST_SONG_WEIGHT = 1;

const getSubmissionAgeWeight = (song: AdminUnverifiedSong, oldestFirstSeenAt: number, newestFirstSeenAt: number) => {
  if (oldestFirstSeenAt === newestFirstSeenAt) return OLDEST_SONG_WEIGHT;

  const age = (newestFirstSeenAt - song.firstSeenAt) / (newestFirstSeenAt - oldestFirstSeenAt);

  return NEWEST_SONG_WEIGHT + age * (OLDEST_SONG_WEIGHT - NEWEST_SONG_WEIGHT);
};

export const getRandomAdminUnverifiedSong = (
  songs: AdminUnverifiedSong[],
  currentSharedSongId?: string,
): AdminUnverifiedSong | undefined => {
  const candidates = songs.filter((song) => song.sharedSongId !== currentSharedSongId);

  if (candidates.length === 0) return undefined;

  const firstSeenAtValues = candidates.map((song) => song.firstSeenAt);
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

export const buildAdminUnverifiedSongProcessingUrl = (sharedSongId: string, processQueue = false) => {
  const searchParams = new URLSearchParams({
    externalSong: sharedSongId,
    admin: 'true',
    step: 'sync',
  });

  if (processQueue) {
    searchParams.set('processQueue', 'true');
  }

  return `${adminEditSongPath}?${searchParams.toString()}`;
};

export const getNextAdminUnverifiedSongProcessingUrl = (songs: AdminUnverifiedSong[], currentSharedSongId: string) => {
  const nextSong = getRandomAdminUnverifiedSong(songs, currentSharedSongId);

  return nextSong ? buildAdminUnverifiedSongProcessingUrl(nextSong.sharedSongId, true) : 'admin/';
};
