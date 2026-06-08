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

export type SharedSongIndexEntry = Pick<
  SharedSongRecord,
  'externalSongId' | 'songId' | 'artist' | 'title' | 'language' | 'videoId' | 'firstSeenAt'
>;

type StoredSharedSongIndexEntry =
  | SharedSongIndexEntry
  | Pick<SharedSongRecord, 'songId' | 'artist' | 'title' | 'language' | 'videoId'>;

const SHARED_SONG_KEY_PREFIX = 'shared-song:';
const INDEX_KEY = 'shared-songs-index';

const getStorageKey = (externalSongId: string) => `${SHARED_SONG_KEY_PREFIX}${externalSongId}`;

const normalizeIndexEntry = (entry: StoredSharedSongIndexEntry): SharedSongIndexEntry => ({
  externalSongId: 'externalSongId' in entry ? entry.externalSongId : entry.songId,
  songId: entry.songId,
  artist: entry.artist,
  title: entry.title,
  language: entry.language,
  videoId: entry.videoId,
  firstSeenAt: 'firstSeenAt' in entry ? entry.firstSeenAt : 0,
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

export const getSharedSong = (kvNamespace: KVNamespace, externalSongId: string) =>
  kvNamespace.get<SharedSongRecord>(getStorageKey(externalSongId), 'json');

export const upsertSharedSong = async (kvNamespace: KVNamespace, record: SharedSongRecord) => {
  const storageKey = getStorageKey(record.externalSongId);
  await kvNamespace.put(storageKey, JSON.stringify(record));
  await addToIndex(kvNamespace, {
    externalSongId: record.externalSongId,
    songId: record.songId,
    artist: record.artist,
    title: record.title,
    language: record.language,
    videoId: record.videoId,
    firstSeenAt: record.firstSeenAt,
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

export type SharedSongUpdate = Pick<
  SharedSongRecord,
  'songId' | 'songTxt' | 'artist' | 'title' | 'language' | 'videoId'
>;

export const updateSharedSong = async (kvNamespace: KVNamespace, externalSongId: string, update: SharedSongUpdate) => {
  const currentRecord = await getSharedSong(kvNamespace, externalSongId);

  if (!currentRecord) {
    return false;
  }

  const updatedRecord: SharedSongRecord = {
    ...currentRecord,
    ...update,
    externalSongId,
    lastSeenAt: Date.now(),
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
  });

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
    .map(({ externalSongId, songId, artist, title, language, videoId, firstSeenAt }) => ({
      externalSongId,
      songId,
      artist,
      title,
      language,
      videoId,
      firstSeenAt,
    }));

  await kvNamespace.put(INDEX_KEY, JSON.stringify(indexEntries));
};
