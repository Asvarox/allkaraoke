import { AdminSharedSong } from './shared-songs-admin-api';

const adminEditSongPath = 'edit/song/';

export const getOldestAdminSharedSong = (
  songs: AdminSharedSong[],
  currentExternalSongId?: string,
): AdminSharedSong | undefined =>
  [...songs]
    .filter((song) => song.externalSongId !== currentExternalSongId)
    .sort((a, b) => a.firstSeenAt - b.firstSeenAt)[0];

export const buildAdminSharedSongProcessingUrl = (externalSongId: string, processQueue = false) => {
  const searchParams = new URLSearchParams({
    externalSong: externalSongId,
    admin: 'true',
    step: 'sync',
  });

  if (processQueue) {
    searchParams.set('processQueue', 'true');
  }

  return `${adminEditSongPath}?${searchParams.toString()}`;
};

export const getNextAdminSharedSongProcessingUrl = (songs: AdminSharedSong[], currentExternalSongId: string) => {
  const nextSong = getOldestAdminSharedSong(songs, currentExternalSongId);

  return nextSong ? buildAdminSharedSongProcessingUrl(nextSong.externalSongId, true) : 'admin/';
};
