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
