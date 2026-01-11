import { SingSetup, SongPreview } from '~/interfaces';
import SongsService from '~/modules/Songs/SongsService';
import storage from '~/modules/utils/storage';

let store: Promise<LocalForage | typeof storage.memory> | null = null;

async function getStorage() {
  if (!store) {
    if ('localStorage' in globalThis) {
      try {
        store = import('localforage').then(({ default: localForage }) =>
          localForage.createInstance({ name: 'localforage' }),
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

export interface SongStats {
  plays: number;
  scores: Array<{
    setup: SingSetup;
    scores: Array<{ name: string; score: number }>;
    date: string;
    progress?: number;
  }>;
}

export const getSongKeyOld = (song: Pick<SongPreview, 'artist' | 'title'>) =>
  `${song.artist}-${song.title}`.toLowerCase();
export const getSongKey = (song: Pick<SongPreview, 'artist' | 'title'>) => SongsService.generateSongFile(song);

export const fetchSongStats = async (song: Pick<SongPreview, 'artist' | 'title'>) => {
  const storageKey = getSongKey(song);
  return (await (await getStorage())?.getItem<SongStats>(storageKey)) || { plays: 0, scores: [] };
};

export const storeSongStats = async (song: Pick<SongPreview, 'artist' | 'title'>, stats: SongStats) => {
  await (await getStorage())?.setItem<SongStats>(getSongKey(song), stats);
};

export const getAllStats = async () => {
  const keys = (await (await getStorage())?.keys()) ?? [];
  const stats: Record<string, SongStats> = {};
  await Promise.all(
    keys.map(async (key) => {
      stats[key] = (await (await getStorage())?.getItem<SongStats>(key))!;
    }),
  );

  return stats;
};
