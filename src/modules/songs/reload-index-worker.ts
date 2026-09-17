import dayjs from 'dayjs';

import { SongPreview } from '~/interfaces';
import getSongId from '~/modules/songs/utils/get-song-id';

// Runs the index merge/sort off the main thread: with ~6000 built-in songs, computing `isBuiltIn`
// for every entry used to be an O(n^2) scan (`defaultIndex.some(...)` called once per song), which
// alone was the bulk of the ~275ms blocking task this used to cause on the main thread at menu mount.

export interface ReloadIndexWorkerRequest {
  requestId: number;
  storageIndex: SongPreview[];
  deletedSongs: string[];
  lastVisit: number;
}

export type ReloadIndexWorkerResponse =
  | {
      requestId: number;
      ok: true;
      defaultIndex: SongPreview[];
      indexWithDeletedSongs: SongPreview[];
      finalIndex: SongPreview[];
      /** Local overrides superseded by a newer default-index entry — safe to drop from storage. */
      removedLocalSongIds: string[];
    }
  | { requestId: number; ok: false; error: string };

const post = (message: ReloadIndexWorkerResponse) => (self as unknown as Worker).postMessage(message);

const generateSongFile = (song: Pick<SongPreview, 'artist' | 'title'> & { id?: string }) => getSongId(song);

self.onmessage = async (event: MessageEvent<ReloadIndexWorkerRequest>) => {
  const { requestId, storageIndex, deletedSongs, lastVisit } = event.data;
  try {
    const defaultIndex: SongPreview[] = await fetch(`/songs/index.json`).then((response) => response.json());
    const defaultIndexIds = new Set(defaultIndex.map((song) => song.id));
    const defaultIndexById = new Map(defaultIndex.map((song) => [song.id, song]));
    const lastVisitDate = dayjs(lastVisit);

    // Filter out local songs that were updated to default index
    const storageIndexWithUpdatedSongs = storageIndex.filter((song) => {
      const defaultSong = defaultIndexById.get(song.id);
      if (!defaultSong) return true;
      return dayjs(song.lastUpdate ?? 0).isAfter(dayjs(defaultSong.lastUpdate ?? 0));
    });
    const localSongs = new Set(storageIndexWithUpdatedSongs.map((song) => song.id));

    const removedLocalSongIds = storageIndex.filter((song) => !localSongs.has(song.id)).map((song) => song.id);

    const indexWithDeletedSongs = [
      ...storageIndexWithUpdatedSongs,
      ...defaultIndex.filter((song) => !localSongs.has(generateSongFile(song))),
    ].map((song) => ({
      ...song,
      isBuiltIn: defaultIndexIds.has(song.id),
      isNew: song.lastUpdate ? dayjs(song.lastUpdate).isAfter(lastVisitDate) : false,
      isDeleted: deletedSongs.includes(generateSongFile(song)),
    }));

    indexWithDeletedSongs.sort((a, b) =>
      `${a.artist} ${a.title}`.localeCompare(`${b.artist} ${b.title}`.toLowerCase()),
    );

    const finalIndex = indexWithDeletedSongs.filter((song) => !song.isDeleted);

    post({ requestId, ok: true, defaultIndex, indexWithDeletedSongs, finalIndex, removedLocalSongIds });
  } catch (error) {
    post({ requestId, ok: false, error: error instanceof Error ? error.message : String(error) });
  }
};
