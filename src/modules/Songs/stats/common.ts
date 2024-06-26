import { SingSetup, SongPreview } from 'interfaces';
import localForage from 'localforage';
import SongsService from 'modules/Songs/SongsService';

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
