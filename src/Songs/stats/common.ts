import { SingSetup, SongPreview } from 'interfaces';
import localForage from 'localforage';
import SongsService from 'Songs/SongsService';

export interface SongStats {
  plays: number;
  scores: Array<{
    setup: SingSetup;
    scores: Array<{ name: string; score: number }>;
    date: string;
  }>;
}

export const getSongKeyOld = (song: Pick<SongPreview, 'artist' | 'title'>) =>
  `${song.artist}-${song.title}`.toLowerCase();
export const getSongKey = (song: Pick<SongPreview, 'artist' | 'title'>) => SongsService.generateSongFile(song);

export const fetchSongStats = async (song: Pick<SongPreview, 'artist' | 'title'>) => {
  const storageKey = getSongKey(song);
  return (await localForage.getItem<SongStats>(storageKey)) || { plays: 0, scores: [] };
};

export const storeSongStats = async (song: Pick<SongPreview, 'artist' | 'title'>, stats: SongStats) => {
  await localForage.setItem<SongStats>(getSongKey(song), stats);
};

export const getAllStats = async () => {
  const keys = await localForage.keys();
  const stats: Record<string, SongStats> = {};
  await Promise.all(
    keys.map(async (key) => {
      stats[key] = (await localForage.getItem<SongStats>(key))!;
    }),
  );

  return stats;
};

if (localStorage.getItem('stats_v2') === null) {
  (async () => {
    const [songs, stats] = await Promise.all([SongsService.getIndex(), getAllStats()]);
    await Promise.all(
      songs
        .filter((song) => stats[getSongKeyOld(song)])
        .map(async (song) => {
          const oldKey = getSongKeyOld(song);
          const newKey = SongsService.generateSongFile(song);

          await localForage.setItem(newKey, stats[oldKey]);
          // await localForage.removeItem(oldKey);
        }),
    );

    localStorage.setItem('stats_v2', 'true');
  })();
}
