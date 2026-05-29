const getRequiredEnv = (name: 'SHARED_SONGS_ADMIN_URL' | 'SHARED_SONGS_ADMIN_TOKEN') => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env variable: ${name}`);
  }
  return value;
};

export const isSharedSongsAdminConfigured = () =>
  !!process.env.SHARED_SONGS_ADMIN_URL && !!process.env.SHARED_SONGS_ADMIN_TOKEN;

const requestSharedSongsAdmin = async (path: string, options: RequestInit) => {
  const baseUrl = getRequiredEnv('SHARED_SONGS_ADMIN_URL');
  const token = getRequiredEnv('SHARED_SONGS_ADMIN_TOKEN');
  const url = new URL(path, baseUrl);

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
      'x-shared-songs-admin-token': token,
    },
  });

  if (!response.ok) {
    throw new Error(`Shared songs admin request failed (${response.status}): ${await response.text()}`);
  }

  return response;
};

export interface SharedSongRecord {
  externalSongId: string;
  songId: string;
  songTxt: string;
  artist: string;
  title: string;
  language: string[];
  videoId: string;
  verifiedAt: number;
  firstSeenAt: number;
  lastSeenAt: number;
  sourceUserId: string;
  sourceEventAt: number;
}

export const upsertSharedSongRecord = async (record: SharedSongRecord) => {
  await requestSharedSongsAdmin('/shared-songs-admin', {
    method: 'POST',
    body: JSON.stringify(record),
  });
};

export const removeSharedSongRecord = async (externalSongId: string) => {
  const encodedSongId = encodeURIComponent(externalSongId);
  await requestSharedSongsAdmin(`/shared-songs-admin?id=${encodedSongId}`, {
    method: 'DELETE',
  });
};
