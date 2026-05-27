export type SharedSongVerificationStatus = 'pending' | 'valid' | 'invalid';

export interface SharedSongRecord {
  externalSongId: string;
  songId: string;
  songTxt: string;
  artist: string;
  title: string;
  language: string[];
  videoId: string;
  verifiedAt: number;
  verificationStatus: SharedSongVerificationStatus;
  verificationErrors: string[];
  firstSeenAt: number;
  lastSeenAt: number;
  sourceUserId: string;
  sourceEventAt: number;
  removedAt: number | null;
}

const SHARED_SONG_KEY_PREFIX = 'shared-song:';

const getStorageKey = (externalSongId: string) => `${SHARED_SONG_KEY_PREFIX}${externalSongId}`;

const listStorageKeys = async (kvNamespace: KVNamespace) => {
  const keys: string[] = [];
  let cursor: string | undefined;

  do {
    const response = await kvNamespace.list({
      prefix: SHARED_SONG_KEY_PREFIX,
      cursor,
    });

    response.keys.forEach((key) => keys.push(key.name));
    cursor = response.list_complete ? undefined : response.cursor;
  } while (cursor);

  return keys;
};

export const listSharedSongs = async (kvNamespace: KVNamespace) => {
  const keys = await listStorageKeys(kvNamespace);
  const records = await Promise.all(keys.map((key) => kvNamespace.get<SharedSongRecord>(key, 'json')));

  return records.filter((record): record is SharedSongRecord => record !== null);
};

export const getSharedSong = (kvNamespace: KVNamespace, externalSongId: string) =>
  kvNamespace.get<SharedSongRecord>(getStorageKey(externalSongId), 'json');

export const upsertSharedSong = async (kvNamespace: KVNamespace, record: SharedSongRecord) => {
  const storageKey = getStorageKey(record.externalSongId);
  await kvNamespace.put(storageKey, JSON.stringify(record));
};

export const removeSharedSong = async (kvNamespace: KVNamespace, externalSongId: string) => {
  const currentRecord = await getSharedSong(kvNamespace, externalSongId);

  if (!currentRecord) {
    return false;
  }

  await kvNamespace.put(
    getStorageKey(externalSongId),
    JSON.stringify({
      ...currentRecord,
      removedAt: Date.now(),
    }),
  );

  return true;
};
