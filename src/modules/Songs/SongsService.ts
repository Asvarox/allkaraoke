import dayjs from 'dayjs';
import { Song, SongPreview } from 'interfaces';
import convertTxtToSong from 'modules/Songs/utils/convertTxtToSong';
import { generatePlayerChangesForTrack } from 'modules/Songs/utils/generatePlayerChanges';
import getSongId from 'modules/Songs/utils/getSongId';
import mergeTracks from 'modules/Songs/utils/mergeTracks';
import { lastVisit } from 'modules/Stats/lastVisit';
import storage from 'modules/utils/storage';
import { getSongPreview } from './utils';

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
  private finalIndex: SongPreview[] | null = null;
  private indexWithDeletedSongs: SongPreview[] | null = null;
  public store = async (song: Song) => {
    await (
      await getStorage()
    )?.setItem(this.generateSongFile(song), {
      ...song,
      lastUpdate: new Date().toISOString(),
    });
    await this.reloadIndex();
  };

  /**
   * Returns true if the song is overridden by a local version and false if it's not added to the main game at all
   * @param songId
   */
  public isOverridden = async (songId: string) => {
    const localSong = await this.getLocal(songId);

    if (!localSong) {
      return false;
    }
    return !!localSong;
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
    const [defaultIndex, storageIndex, deletedSongs] = await Promise.all([
      fetch(`/songs/index.json`).then((response) => response.json() as Promise<SongPreview[]>),
      this.getLocalIndex(),
      this.getDeletedSongsList(),
    ]);
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

    this.indexWithDeletedSongs = [
      ...storageIndexWithUpdatedSongs,
      ...defaultIndex.filter((song) => !localSongs.includes(this.generateSongFile(song))),
    ].map((song) => ({
      ...song,
      isNew: song.lastUpdate ? dayjs(song.lastUpdate).isAfter(lastVisitDate) : false,
      isDeleted: deletedSongs?.includes(this.generateSongFile(song)),
    }));

    this.indexWithDeletedSongs.sort((a, b) =>
      `${a.artist} ${a.title}`.localeCompare(`${b.artist} ${b.title}`.toLowerCase()),
    );

    this.finalIndex = this.indexWithDeletedSongs.filter((song) => !song.isDeleted);
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
          return getSongPreview(song, true);
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
