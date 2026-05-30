import { SharedSongPayload, SharedSongSearchResult } from '~/modules/Songs/sharedSongs/types';

const SHARED_SONGS_LIMIT = 10;

export const getSharedSongsSearch = async (
  query: string,
  limit = SHARED_SONGS_LIMIT,
): Promise<SharedSongSearchResult[]> => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  const url = new URL('/shared-songs', global.location?.origin ?? 'https://allkaraoke.party');
  url.searchParams.set('query', trimmedQuery);
  url.searchParams.set('limit', `${limit}`);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as SharedSongSearchResult[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const getSharedSongById = async (externalSongId: string): Promise<SharedSongPayload> => {
  const trimmedSongId = externalSongId.trim();
  if (!trimmedSongId) {
    throw new Error('Missing external song id');
  }

  const url = new URL('/shared-song', global.location?.origin ?? 'https://allkaraoke.party');
  url.searchParams.set('id', trimmedSongId);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch shared song: ${response.status}`);
  }

  return (await response.json()) as SharedSongPayload;
};
