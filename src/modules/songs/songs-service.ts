import dayjs from 'dayjs';

import { Song, SongPreview } from '~/interfaces';
import convertTxtToSong from '~/modules/songs/utils/convert-txt-to-song';
import { generatePlayerChangesForTrack } from '~/modules/songs/utils/generate-player-changes';
import getSongId from '~/modules/songs/utils/get-song-id';
import mergeTracks from '~/modules/songs/utils/merge-tracks';
import { lastVisit } from '~/modules/stats/last-visit';
import storage from '~/modules/utils/storage';

import { getSongPreview } from './utils';

// Building the per-song preview (isBuiltIn/isNew/isDeleted) is a plain per-item transform, so unlike
// JSON.parse or Array.sort (opaque, atomic engine calls that can't be paused), it can be sliced: yield
// back to the browser every CHUNK_SIZE items so a long list doesn't block a single animation frame.
const CHUNK_SIZE = 1000;
const yieldToBrowser = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

async function mapInChunks<T, R>(items: T[], fn: (item: T) => R): Promise<R[]> {
  const result: R[] = new Array(items.length);
  for (let i = 0; i < items.length; i++) {
    result[i] = fn(items[i]);
    if (i > 0 && i % CHUNK_SIZE === 0) {
      await yieldToBrowser();
    }
  }
  return result;
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
  private defaultIndexIds: Set<string> | null = null;
  private finalIndex: SongPreview[] | null = null;
  private indexWithDeletedSongs: SongPreview[] | null = null;
  // Bumped at the start of every reloadIndex() call and checked when its fetch resolves, so a
  // slow-to-resolve call (e.g. the menu's warmup) can't clobber a newer one that already applied —
  // otherwise it could overwrite a just-stored song with a stale pre-store snapshot.
  private reloadSeq = 0;
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
    return this.defaultIndexIds?.has(songId) ?? false;
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
    const seq = ++this.reloadSeq;
    const [defaultIndex, storageIndex, deletedSongs] = await Promise.all([
      fetch(`/songs/index.json`).then((response) => response.json() as Promise<SongPreview[]>),
      this.getLocalIndex(),
      this.getDeletedSongsList(),
    ]);

    // A newer reloadIndex() call was issued while this one was still in flight — applying this stale
    // result could undo whatever the newer call already did. Exception: if nothing has ever been
    // applied yet, apply it anyway so callers never see a permanently-null index; the newer call
    // (which is still in flight) will correct it once it lands.
    if (seq !== this.reloadSeq && this.finalIndex !== null) return;

    // A Set lookup, not `defaultIndex.some(...)` per song below: with ~6000 built-in songs, doing that
    // scan once per song in the merged list was an O(n^2) pass and the main cost of this method.
    const defaultIndexIds = new Set(defaultIndex.map((song) => song.id));
    this.defaultIndexIds = defaultIndexIds;
    const lastVisitDate = dayjs(lastVisit);

    // Filter out local songs that were updated to default index
    const storageIndexWithUpdatedSongs = storageIndex.filter((song) => {
      const defaultSong = defaultIndex.find((localSong) => localSong.id === song.id);
      if (!defaultSong) return true;
      return dayjs(song.lastUpdate ?? 0).isAfter(dayjs(defaultSong.lastUpdate ?? 0));
    });
    const localSongs = storageIndexWithUpdatedSongs.map((song) => song.id);

    storageIndex.forEach(async (song) => {
      if (!localSongs.includes(song.id)) {
        (await getStorage()).removeItem(song.id);
      }
    });

    const merged = [
      ...storageIndexWithUpdatedSongs,
      ...defaultIndex.filter((song) => !localSongs.includes(this.generateSongFile(song))),
    ];

    const indexWithDeletedSongs = await mapInChunks(merged, (song) => ({
      ...song,
      isBuiltIn: defaultIndexIds.has(song.id),
      isNew: song.lastUpdate ? dayjs(song.lastUpdate).isAfter(lastVisitDate) : false,
      isDeleted: deletedSongs?.includes(this.generateSongFile(song)),
    }));

    // Re-checked here too: the chunked map above yields repeatedly, widening the window in which a
    // newer reloadIndex() call could have been issued (and possibly already applied) while this one
    // was still working through its chunks.
    if (seq !== this.reloadSeq && this.finalIndex !== null) return;

    indexWithDeletedSongs.sort((a, b) =>
      `${a.artist} ${a.title}`.localeCompare(`${b.artist} ${b.title}`.toLowerCase()),
    );

    this.indexWithDeletedSongs = indexWithDeletedSongs;
    this.finalIndex = indexWithDeletedSongs.filter((song) => !song.isDeleted);
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
