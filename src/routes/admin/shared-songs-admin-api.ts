import { Song } from '~/interfaces';
import convertSongToTxt from '~/modules/songs/utils/convert-song-to-txt';
import { getAdminPassword } from './admin-password';

export interface AdminSharedSong {
  externalSongId: string;
  songId: string;
  artist: string;
  title: string;
  language: string[];
  videoId: string;
  firstSeenAt: number;
}

class AdminSharedSongsApiError extends Error {
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

  throw new AdminSharedSongsApiError(message, response.status);
};

const adminHeaders = (password: string) => ({
  'x-admin-panel-password': password,
});

export const listAdminSharedSongs = async (password: string) => {
  const response = await fetch('/admin/shared-songs', {
    headers: adminHeaders(password),
  });
  await assertOk(response);

  return response.json() as Promise<AdminSharedSong[]>;
};

export const deleteAdminSharedSong = async (password: string, externalSongId: string) => {
  const url = new URL('/admin/shared-songs', window.location.origin);
  url.searchParams.set('id', externalSongId);
  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: adminHeaders(password),
  });
  await assertOk(response);
};

export const regenerateAdminSharedSongsIndex = async (password: string) => {
  const response = await fetch('/admin/shared-songs', {
    method: 'PUT',
    headers: adminHeaders(password),
  });
  await assertOk(response);
};

export const updateAdminSharedSong = async (externalSongId: string, song: Song) => {
  const password = getAdminPassword();
  const url = new URL('/admin/shared-song', window.location.origin);
  url.searchParams.set('id', externalSongId);
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
