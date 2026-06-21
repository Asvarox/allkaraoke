export interface UnverifiedSongRecord {
  sharedSongId: string;
  externalSongId?: string;
  songId: string;
  songTxt: string;
  artist: string;
  title: string;
  language: string[];
  videoId: string;
  validatedAt: number;
  firstSeenAt: number;
  updated: number;
  lastSeenAt: number;
  sourceUserId: string;
  sourceEventAt: number;
}

export type UnverifiedSongIndexEntry = Pick<
  UnverifiedSongRecord,
  'sharedSongId' | 'externalSongId' | 'songId' | 'artist' | 'title' | 'language' | 'videoId' | 'firstSeenAt' | 'updated'
>;

type LegacyUnverifiedSongRecord = Omit<UnverifiedSongRecord, 'sharedSongId' | 'validatedAt'> & {
  sharedSongId?: string;
  externalSongId?: string;
  validatedAt?: number;
  verifiedAt?: number;
};

type LegacyUnverifiedSongIndexEntry = Omit<UnverifiedSongIndexEntry, 'sharedSongId'> & {
  sharedSongId?: string;
  externalSongId?: string;
};

const LEGACY_SHARED_SONG_KEY_PREFIX = 'shared-song:';
const LEGACY_SHARED_SONGS_INDEX_KEY = 'shared-songs-index';

const getStorageKey = (sharedSongId: string) => `${LEGACY_SHARED_SONG_KEY_PREFIX}${sharedSongId}`;

const getLegacySharedSongId = (record: { sharedSongId?: string; externalSongId?: string }) =>
  record.sharedSongId ?? record.externalSongId;

const normalizeRecord = (record: LegacyUnverifiedSongRecord | null): UnverifiedSongRecord | null => {
  if (!record) return null;

  const sharedSongId = getLegacySharedSongId(record);
  const validatedAt = record.validatedAt ?? record.verifiedAt;
  if (!sharedSongId || typeof validatedAt !== 'number') return null;

  return {
    ...record,
    sharedSongId,
    externalSongId: sharedSongId,
    validatedAt,
  };
};

const normalizeIndexEntry = (entry: LegacyUnverifiedSongIndexEntry | null): UnverifiedSongIndexEntry | null => {
  if (!entry) return null;

  const sharedSongId = getLegacySharedSongId(entry);
  if (!sharedSongId) return null;

  return {
    ...entry,
    sharedSongId,
    externalSongId: sharedSongId,
  };
};

const getIndex = async (kvNamespace: KVNamespace): Promise<UnverifiedSongIndexEntry[]> =>
  ((await kvNamespace.get<LegacyUnverifiedSongIndexEntry[]>(LEGACY_SHARED_SONGS_INDEX_KEY, 'json')) ?? []).flatMap(
    (entry) => {
      const normalizedEntry = normalizeIndexEntry(entry);
      return normalizedEntry ? [normalizedEntry] : [];
    },
  );

const addToIndex = async (kvNamespace: KVNamespace, entry: UnverifiedSongIndexEntry) => {
  const index = await getIndex(kvNamespace);
  const nextIndex = [...index.filter((song) => song.sharedSongId !== entry.sharedSongId), entry];
  await kvNamespace.put(LEGACY_SHARED_SONGS_INDEX_KEY, JSON.stringify(nextIndex));
};

const removeFromIndex = async (kvNamespace: KVNamespace, sharedSongId: string) => {
  const index = await getIndex(kvNamespace);
  await kvNamespace.put(
    LEGACY_SHARED_SONGS_INDEX_KEY,
    JSON.stringify(index.filter((song) => song.sharedSongId !== sharedSongId)),
  );
};

export const listUnverifiedSongs = async (kvNamespace: KVNamespace) => {
  const index = await getIndex(kvNamespace);

  return index;
};

export const getUnverifiedSong = async (kvNamespace: KVNamespace, sharedSongId: string) => {
  return normalizeRecord(await kvNamespace.get<LegacyUnverifiedSongRecord>(getStorageKey(sharedSongId), 'json'));
};

export const upsertUnverifiedSong = async (kvNamespace: KVNamespace, record: UnverifiedSongRecord) => {
  const storageKey = getStorageKey(record.sharedSongId);
  const storageRecord: UnverifiedSongRecord = {
    ...record,
    externalSongId: record.sharedSongId,
    validatedAt: record.validatedAt,
  };
  await kvNamespace.put(storageKey, JSON.stringify(storageRecord));
  await addToIndex(kvNamespace, {
    sharedSongId: record.sharedSongId,
    externalSongId: record.sharedSongId,
    songId: record.songId,
    artist: record.artist,
    title: record.title,
    language: record.language,
    videoId: record.videoId,
    firstSeenAt: record.firstSeenAt,
    updated: record.updated,
  });
};

export const removeUnverifiedSong = async (kvNamespace: KVNamespace, sharedSongId: string) => {
  const currentRecord = await getUnverifiedSong(kvNamespace, sharedSongId);

  if (!currentRecord) {
    await removeFromIndex(kvNamespace, sharedSongId);
    return false;
  }

  await kvNamespace.delete(getStorageKey(sharedSongId));
  await removeFromIndex(kvNamespace, sharedSongId);

  return true;
};

export type UnverifiedSongUpdate = Pick<
  UnverifiedSongRecord,
  'songId' | 'songTxt' | 'artist' | 'title' | 'language' | 'videoId'
>;

export const updateUnverifiedSong = async (
  kvNamespace: KVNamespace,
  sharedSongId: string,
  update: UnverifiedSongUpdate,
) => {
  const currentRecord = await getUnverifiedSong(kvNamespace, sharedSongId);

  if (!currentRecord) {
    return false;
  }

  const now = Date.now();
  const updatedRecord: UnverifiedSongRecord = {
    ...currentRecord,
    ...update,
    sharedSongId,
    externalSongId: sharedSongId,
    updated: now,
    lastSeenAt: now,
  };

  await kvNamespace.put(getStorageKey(sharedSongId), JSON.stringify(updatedRecord));
  await addToIndex(kvNamespace, {
    sharedSongId,
    externalSongId: sharedSongId,
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
  const listResponse = await kvNamespace.list({ prefix: LEGACY_SHARED_SONG_KEY_PREFIX });
  const records = await Promise.all(
    listResponse.keys.map(async ({ name }) => {
      return normalizeRecord(await kvNamespace.get<LegacyUnverifiedSongRecord>(name, 'json'));
    }),
  );

  const indexEntries: UnverifiedSongIndexEntry[] = records
    .filter((record): record is UnverifiedSongRecord => record !== null)
    .map(({ sharedSongId, songId, artist, title, language, videoId, firstSeenAt, updated }) => ({
      sharedSongId,
      externalSongId: sharedSongId,
      songId,
      artist,
      title,
      language,
      videoId,
      firstSeenAt,
      updated,
    }));

  await kvNamespace.put(LEGACY_SHARED_SONGS_INDEX_KEY, JSON.stringify(indexEntries));
};
