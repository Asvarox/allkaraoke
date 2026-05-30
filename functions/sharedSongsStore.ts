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

const SHARED_SONG_KEY_PREFIX = 'shared-song:';
const INDEX_KEY = 'shared-songs-index';

const getStorageKey = (externalSongId: string) => `${SHARED_SONG_KEY_PREFIX}${externalSongId}`;

const getIndex = async (kvNamespace: KVNamespace): Promise<string[]> =>
  (await kvNamespace.get<string[]>(INDEX_KEY, 'json')) ?? [];

const addToIndex = async (kvNamespace: KVNamespace, externalSongId: string) => {
  const index = await getIndex(kvNamespace);
  if (!index.includes(externalSongId)) {
    await kvNamespace.put(INDEX_KEY, JSON.stringify([...index, externalSongId]));
  }
};

const removeFromIndex = async (kvNamespace: KVNamespace, externalSongId: string) => {
  const index = await getIndex(kvNamespace);
  await kvNamespace.put(INDEX_KEY, JSON.stringify(index.filter((id) => id !== externalSongId)));
};

export const listSharedSongs = async (kvNamespace: KVNamespace) => {
  const index = await getIndex(kvNamespace);
  const records = await Promise.all(index.map((id) => kvNamespace.get<SharedSongRecord>(getStorageKey(id), 'json')));

  return records.filter((record): record is SharedSongRecord => record !== null);
};

export const getSharedSong = (kvNamespace: KVNamespace, externalSongId: string) =>
  kvNamespace.get<SharedSongRecord>(getStorageKey(externalSongId), 'json');

export const upsertSharedSong = async (kvNamespace: KVNamespace, record: SharedSongRecord) => {
  const storageKey = getStorageKey(record.externalSongId);
  await kvNamespace.put(storageKey, JSON.stringify(record));
  await addToIndex(kvNamespace, record.externalSongId);
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
