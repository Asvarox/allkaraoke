import { Song, SongPreview } from '~/interfaces';
import { ReloadIndexWorkerRequest, ReloadIndexWorkerResponse } from '~/modules/songs/reload-index-worker';
import convertTxtToSong from '~/modules/songs/utils/convert-txt-to-song';
import { generatePlayerChangesForTrack } from '~/modules/songs/utils/generate-player-changes';
import getSongId from '~/modules/songs/utils/get-song-id';
import mergeTracks from '~/modules/songs/utils/merge-tracks';
import { lastVisit } from '~/modules/stats/last-visit';
import storage from '~/modules/utils/storage';

import { getSongPreview } from './utils';

// Lazily started, kept alive for the app's lifetime: reloadIndex can be called many times (song
// import, delete, restore...) and each call is cheap once the worker is warm, so there's no benefit
// to tearing it down between calls.
let indexWorker: Worker | null = null;
let nextRequestId = 0;
const pendingRequests = new Map<
  number,
  { resolve: (value: Extract<ReloadIndexWorkerResponse, { ok: true }>) => void; reject: (error: Error) => void }
>();

function getIndexWorker() {
  if (!indexWorker) {
    indexWorker = new Worker(new URL('./reload-index-worker.ts', import.meta.url), { type: 'module' });
    indexWorker.onmessage = (event: MessageEvent<ReloadIndexWorkerResponse>) => {
      const message = event.data;
      const pending = pendingRequests.get(message.requestId);
      if (!pending) return;
      pendingRequests.delete(message.requestId);

      if (message.ok) {
        pending.resolve(message);
      } else {
        pending.reject(new Error(message.error));
      }
    };
    indexWorker.onerror = (event) => {
      pendingRequests.forEach(({ reject }) => reject(new Error(event.message)));
      pendingRequests.clear();
    };
  }
  return indexWorker;
}

function reloadIndexInWorker(request: Omit<ReloadIndexWorkerRequest, 'requestId'>) {
  const requestId = nextRequestId++;
  return new Promise<Extract<ReloadIndexWorkerResponse, { ok: true }>>((resolve, reject) => {
    pendingRequests.set(requestId, { resolve, reject });
    getIndexWorker().postMessage({ ...request, requestId } satisfies ReloadIndexWorkerRequest);
  });
}

let store: Promise<LocalForage | typeof storage.memory> | null = null;

async function getStorage() {
  if (!store) {
    if ('localStorage' in globalThis) {
      try {
        store = import('localforage').then(({ default: localForage }) =>
          localForage.createInstance({ name: 'songs_v2' }),
        );
      } catch (e) {
        console.error(e);
        store = Promise.resolve(storage.memory);
      }
    } else {
      store = Promise.resolve(storage.memory);
    }
  }
  return store;
}

const DELETED_SONGS_KEY = 'DELETED_SONGS_V2';

class SongsService {
  private defaultIndex: SongPreview[] | null = null;
  private finalIndex: SongPreview[] | null = null;
  private indexWithDeletedSongs: SongPreview[] | null = null;
  public store = async (song: Song, reloadIndex = true) => {
    await (
      await getStorage()
    )?.setItem(this.generateSongFile(song), {
      ...song,
      lastUpdate: new Date().toISOString(),
    });
    if (reloadIndex) {
      await this.reloadIndex();
    }
  };

  /**
   * Returns true if the song is overridden by a local version and false if it's not added to the main game at all
   * @param songId
   */
  public isOverridden = async (songId: string) => {
    const localSong = await this.getLocal(songId);

    return !!localSong;
  };

  /**
   * Returns true if the song is included in the main game by default
   * @param songId
   */
  public isBuiltIn = (songId: string) => {
    return this.defaultIndex?.some((song) => song.id === songId) ?? false;
  };

  public get = async (songId: string): Promise<Song> => {
    const localSong = await this.getLocal(songId);

    if (!localSong) {
      return await fetch(`/songs/${songId}.txt`)
        .then((response) => response.text())
        .then(convertTxtToSong)
        .then((song) => ({ ...song, local: false }));
    }

    return { ...localSong, local: true };
  };

  public getIndex = async (includeDeleted = false): Promise<SongPreview[]> => {
    if (this.finalIndex === null) {
      await this.reloadIndex();
    }

    return includeDeleted ? this.indexWithDeletedSongs! : this.finalIndex!;
  };

  public getCurrentIndex = () => this.finalIndex;

  public getDeletedSongsList = async () => {
    const list = await (await getStorage())?.getItem<string[]>(DELETED_SONGS_KEY);

    return list ?? [];
  };

  public generateSongFile = (song: Pick<Song | SongPreview, 'artist' | 'title'> & { id?: string }) => getSongId(song);

  public reloadIndex = async () => {
    const [storageIndex, deletedSongs] = await Promise.all([this.getLocalIndex(), this.getDeletedSongsList()]);

    const { defaultIndex, indexWithDeletedSongs, finalIndex, removedLocalSongIds } = await reloadIndexInWorker({
      storageIndex,
      deletedSongs,
      lastVisit,
    });

    this.defaultIndex = defaultIndex;
    this.indexWithDeletedSongs = indexWithDeletedSongs;
    this.finalIndex = finalIndex;

    if (removedLocalSongIds.length) {
      const songStorage = await getStorage();
      removedLocalSongIds.forEach((id) => songStorage.removeItem(id));
    }
  };

  public deleteSong = async (songId: string) => {
    await (await getStorage()).removeItem(songId);

    return this.reloadIndex();
  };

  public softDeleteSong = async (songId: string) => {
    const deletedItems = await this.getDeletedSongsList();
    await (await getStorage()).setItem(DELETED_SONGS_KEY, [...new Set([...deletedItems, songId])]);
    return this.reloadIndex();
  };
  public restoreSong = async (songId: string) => {
    const deletedItems = await this.getDeletedSongsList();
    await (
      await getStorage()
    ).setItem(
      DELETED_SONGS_KEY,
      deletedItems.filter((item) => item !== songId),
    );
    return this.reloadIndex();
  };

  private getLocal = async (songId: string) => {
    const song = await (await getStorage())?.getItem<Song>(decodeURIComponent(songId));
    if (song && !!song.tracks) {
      return {
        ...song,
        language: !Array.isArray(song.language) ? [song.language as string] : song.language,
        mergedTrack: mergeTracks(song.tracks, song),
        tracks: song.tracks.map((track) => ({
          ...track,
          changes: generatePlayerChangesForTrack(track, song),
        })),
      };
    }
    return null;
  };

  public getLocalIndex = async () => {
    const allSongs = await Promise.all((await this.getKeys()).map(this.getLocal));

    return allSongs
      .filter((song): song is Song => song !== null)
      .map((song) => {
        try {
          return getSongPreview(song, { local: true });
        } catch (e) {
          console.error(e);
          return null;
        }
      })
      .filter((song): song is SongPreview => song !== null);
  };

  private getKeys = async () => {
    const specialKeys = [DELETED_SONGS_KEY];

    return (await (await getStorage()).keys()).filter((key) => !specialKeys.includes(key));
  };
}

export default new SongsService();
