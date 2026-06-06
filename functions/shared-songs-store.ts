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

export type SharedSongIndexEntry = Pick<SharedSongRecord, 'songId' | 'artist' | 'title' | 'language' | 'videoId'>;

const SHARED_SONG_KEY_PREFIX = 'shared-song:';
const INDEX_KEY = 'shared-songs-index';

const getStorageKey = (externalSongId: string) => `${SHARED_SONG_KEY_PREFIX}${externalSongId}`;

const getIndex = async (kvNamespace: KVNamespace): Promise<SharedSongIndexEntry[]> =>
  (await kvNamespace.get<SharedSongIndexEntry[]>(INDEX_KEY, 'json')) ?? [];

const addToIndex = async (kvNamespace: KVNamespace, entry: SharedSongIndexEntry) => {
  const index = await getIndex(kvNamespace);
  if (!index.some(({ songId }) => songId === entry.songId)) {
    await kvNamespace.put(INDEX_KEY, JSON.stringify([...index, entry]));
  }
};

const removeFromIndex = async (kvNamespace: KVNamespace, externalSongId: string) => {
  const index = await getIndex(kvNamespace);
  await kvNamespace.put(INDEX_KEY, JSON.stringify(index.filter(({ songId }) => songId !== externalSongId)));
};

export const listSharedSongs = async (kvNamespace: KVNamespace) => {
  const index = await getIndex(kvNamespace);

  return index;
};

export const getSharedSong = (kvNamespace: KVNamespace, externalSongId: string) =>
  kvNamespace.get<SharedSongRecord>(getStorageKey(externalSongId), 'json');

export const upsertSharedSong = async (kvNamespace: KVNamespace, record: SharedSongRecord) => {
  const storageKey = getStorageKey(record.externalSongId);
  await kvNamespace.put(storageKey, JSON.stringify(record));
  await addToIndex(kvNamespace, {
    songId: record.songId,
    artist: record.artist,
    title: record.title,
    language: record.language,
    videoId: record.videoId,
  });
};

export const removeSharedSong = async (kvNamespace: KVNamespace, externalSongId: string) => {
  const currentRecord = await getSharedSong(kvNamespace, externalSongId);

  if (!currentRecord) {
    return false;
  }

  await kvNamespace.delete(getStorageKey(externalSongId));
  await removeFromIndex(kvNamespace, externalSongId);

  return true;
};

export const regenerateIndex = async (kvNamespace: KVNamespace) => {
  const listResponse = await kvNamespace.list({ prefix: SHARED_SONG_KEY_PREFIX });
  const records = await Promise.all(
    listResponse.keys.map(async ({ name }) => {
      const record = await kvNamespace.get<SharedSongRecord>(name, 'json');
      return record;
    }),
  );

  const indexEntries: SharedSongIndexEntry[] = records
    .filter((record): record is SharedSongRecord => record !== null)
    .map(({ songId, artist, title, language, videoId }) => ({
      songId,
      artist,
      title,
      language,
      videoId,
    }));

  await kvNamespace.put(INDEX_KEY, JSON.stringify(indexEntries));
};
