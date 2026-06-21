import { AdminUnverifiedSong } from './unverified-songs-admin-api';

const adminEditSongPath = 'edit/song/';

export const getOldestAdminUnverifiedSong = (
  songs: AdminUnverifiedSong[],
  currentSharedSongId?: string,
): AdminUnverifiedSong | undefined =>
  [...songs].filter((song) => song.sharedSongId !== currentSharedSongId).sort((a, b) => a.updated - b.updated)[0];

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
  const nextSong = getOldestAdminUnverifiedSong(songs, currentSharedSongId);

  return nextSong ? buildAdminUnverifiedSongProcessingUrl(nextSong.sharedSongId, true) : 'admin/';
};
