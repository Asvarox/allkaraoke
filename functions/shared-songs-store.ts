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
  updated: number;
  lastSeenAt: number;
  sourceUserId: string;
  sourceEventAt: number;
}

export type SharedSongIndexEntry = Pick<
  SharedSongRecord,
  'externalSongId' | 'songId' | 'artist' | 'title' | 'language' | 'videoId' | 'firstSeenAt' | 'updated'
>;

type StoredSharedSongRecord = SharedSongRecord | Omit<SharedSongRecord, 'updated'>;

type StoredSharedSongIndexEntry =
  | SharedSongIndexEntry
  | Pick<SharedSongRecord, 'songId' | 'artist' | 'title' | 'language' | 'videoId'>
  | Omit<SharedSongIndexEntry, 'updated'>;

const SHARED_SONG_KEY_PREFIX = 'shared-song:';
const INDEX_KEY = 'shared-songs-index';

const getStorageKey = (externalSongId: string) => `${SHARED_SONG_KEY_PREFIX}${externalSongId}`;

const normalizeRecord = (record: StoredSharedSongRecord | SharedSongRecord): SharedSongRecord => ({
  ...record,
  updated: 'updated' in record ? record.updated : record.firstSeenAt,
});

const normalizeIndexEntry = (entry: StoredSharedSongIndexEntry): SharedSongIndexEntry => ({
  externalSongId: 'externalSongId' in entry ? entry.externalSongId : entry.songId,
  songId: entry.songId,
  artist: entry.artist,
  title: entry.title,
  language: entry.language,
  videoId: entry.videoId,
  firstSeenAt: 'firstSeenAt' in entry ? entry.firstSeenAt : 0,
  updated: ('updated' in entry ? entry.updated : undefined) ?? ('firstSeenAt' in entry ? entry.firstSeenAt : 0),
});

const getIndex = async (kvNamespace: KVNamespace): Promise<SharedSongIndexEntry[]> =>
  ((await kvNamespace.get<StoredSharedSongIndexEntry[]>(INDEX_KEY, 'json')) ?? []).map(normalizeIndexEntry);

const addToIndex = async (kvNamespace: KVNamespace, entry: SharedSongIndexEntry) => {
  const index = await getIndex(kvNamespace);
  const nextIndex = [...index.filter((song) => song.externalSongId !== entry.externalSongId), entry];
  await kvNamespace.put(INDEX_KEY, JSON.stringify(nextIndex));
};

const removeFromIndex = async (kvNamespace: KVNamespace, externalSongId: string) => {
  const index = await getIndex(kvNamespace);
  await kvNamespace.put(INDEX_KEY, JSON.stringify(index.filter((song) => song.externalSongId !== externalSongId)));
};

export const listSharedSongs = async (kvNamespace: KVNamespace) => {
  const index = await getIndex(kvNamespace);

  return index;
};

export const getSharedSong = async (kvNamespace: KVNamespace, externalSongId: string) => {
  const record = await kvNamespace.get<StoredSharedSongRecord>(getStorageKey(externalSongId), 'json');
  return record ? normalizeRecord(record) : null;
};

export const upsertSharedSong = async (kvNamespace: KVNamespace, record: StoredSharedSongRecord) => {
  const normalizedRecord = normalizeRecord(record);
  const storageKey = getStorageKey(normalizedRecord.externalSongId);
  await kvNamespace.put(storageKey, JSON.stringify(normalizedRecord));
  await addToIndex(kvNamespace, {
    externalSongId: normalizedRecord.externalSongId,
    songId: normalizedRecord.songId,
    artist: normalizedRecord.artist,
    title: normalizedRecord.title,
    language: normalizedRecord.language,
    videoId: normalizedRecord.videoId,
    firstSeenAt: normalizedRecord.firstSeenAt,
    updated: normalizedRecord.updated,
  });
};

export const removeSharedSong = async (kvNamespace: KVNamespace, externalSongId: string) => {
  const currentRecord = await getSharedSong(kvNamespace, externalSongId);

  if (!currentRecord) {
    await removeFromIndex(kvNamespace, externalSongId);
    return false;
  }

  await kvNamespace.delete(getStorageKey(externalSongId));
  await removeFromIndex(kvNamespace, externalSongId);

  return true;
};

export type SharedSongUpdate = Pick<
  SharedSongRecord,
  'songId' | 'songTxt' | 'artist' | 'title' | 'language' | 'videoId'
>;

export const updateSharedSong = async (kvNamespace: KVNamespace, externalSongId: string, update: SharedSongUpdate) => {
  const currentRecord = await getSharedSong(kvNamespace, externalSongId);

  if (!currentRecord) {
    return false;
  }

  const now = Date.now();
  const updatedRecord: SharedSongRecord = {
    ...currentRecord,
    ...update,
    externalSongId,
    updated: now,
    lastSeenAt: now,
  };

  await kvNamespace.put(getStorageKey(externalSongId), JSON.stringify(updatedRecord));
  await addToIndex(kvNamespace, {
    externalSongId,
    songId: updatedRecord.songId,
    artist: updatedRecord.artist,
    title: updatedRecord.title,
    language: updatedRecord.language,
    videoId: updatedRecord.videoId,
    firstSeenAt: updatedRecord.firstSeenAt,
    updated: updatedRecord.updated,
  });

  return true;
};

export const regenerateIndex = async (kvNamespace: KVNamespace) => {
  const listResponse = await kvNamespace.list({ prefix: SHARED_SONG_KEY_PREFIX });
  const records = await Promise.all(
    listResponse.keys.map(async ({ name }) => {
      const record = await kvNamespace.get<StoredSharedSongRecord>(name, 'json');
      return record ? normalizeRecord(record) : null;
    }),
  );

  const indexEntries: SharedSongIndexEntry[] = records
    .filter((record): record is SharedSongRecord => record !== null)
    .map(({ externalSongId, songId, artist, title, language, videoId, firstSeenAt, updated }) => ({
      externalSongId,
      songId,
      artist,
      title,
      language,
      videoId,
      firstSeenAt,
      updated,
    }));

  await kvNamespace.put(INDEX_KEY, JSON.stringify(indexEntries));
};
