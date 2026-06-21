import { UnverifiedSongPayload, UnverifiedSongSearchResult } from '~/modules/songs/unverified-songs/types';

const UNVERIFIED_SONGS_LIMIT = 10;

export const getUnverifiedSongsSearch = async (
  query: string,
  limit = UNVERIFIED_SONGS_LIMIT,
): Promise<UnverifiedSongSearchResult[]> => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  const url = new URL('/unverified-songs', global.location?.origin ?? 'https://allkaraoke.party');
  url.searchParams.set('query', trimmedQuery);
  url.searchParams.set('limit', `${limit}`);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as UnverifiedSongSearchResult[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const getUnverifiedSongById = async (sharedSongId: string): Promise<UnverifiedSongPayload> => {
  const trimmedSongId = sharedSongId.trim();
  if (!trimmedSongId) {
    throw new Error('Missing shared song id');
  }

  const url = new URL('/unverified-song', global.location?.origin ?? 'https://allkaraoke.party');
  url.searchParams.set('id', trimmedSongId);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch unverified song: ${response.status}`);
  }

  return (await response.json()) as UnverifiedSongPayload;
};
