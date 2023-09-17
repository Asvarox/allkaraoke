import { SingSetup, SongPreview } from 'interfaces';
import localForage from 'localforage';

export interface SongStats {
  plays: number;
  scores: Array<{
    setup: SingSetup;
    scores: Array<{ name: string; score: number }>;
    date: string;
  }>;
}

export const getSongKey = (song: Pick<SongPreview, 'artist' | 'title'>) => `${song.artist}-${song.title}`.toLowerCase();

export const fetchSongStats = async (song: Pick<SongPreview, 'artist' | 'title'>) => {
  const storageKey = getSongKey(song);
  return (await localForage.getItem<SongStats>(storageKey)) || { plays: 0, scores: [] };
};

export const storeSongStats = async (song: Pick<SongPreview, 'artist' | 'title'>, stats: SongStats) => {
  await localForage.setItem<SongStats>(getSongKey(song), stats);
};
