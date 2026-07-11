import { AdminUnverifiedSong } from './unverified-songs-admin-api';

const adminEditSongPath = 'edit/song/';

export const getRandomAdminUnverifiedSong = (
  songs: AdminUnverifiedSong[],
  currentSharedSongId?: string,
): AdminUnverifiedSong | undefined => {
  const candidates = songs.filter((song) => song.sharedSongId !== currentSharedSongId);

  return candidates[Math.floor(Math.random() * candidates.length)];
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
