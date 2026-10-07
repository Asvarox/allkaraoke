import { useEffect, useState } from 'react';

import { SongPreview } from '~/interfaces';
import events from '~/modules/game-events/game-events';
import { useEventEffect } from '~/modules/game-events/hooks';
import { SongStats, fetchSongStats, getAllStats, getSongKey, storeSongStats } from '~/modules/songs/stats/common';

export const useSongStats = (song: Pick<SongPreview, 'artist' | 'title'>) => {
  const [stats, setStats] = useState<SongStats | null>(null);

  const storageKey = getSongKey(song);

  const setSongStats = async () => {
    // Storage that can't be read counts as no record, rather than leaving callers waiting on stats
    // that never come (the song preview's board is only requested once they're in)
    const loaded = await fetchSongStats(song).catch((error: unknown) => {
      console.error(error);
      return { plays: 0, scores: [] } satisfies SongStats;
    });
    setStats(loaded);
  };

  useEffect(() => {
    setSongStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch stats only when the song key changes
  }, [storageKey]);

  useEventEffect(events.songStatStored, setSongStats);

  return stats;
};

export const useEditScore = (song: Pick<SongPreview, 'artist' | 'title'>) => {
  return async (singId: string, score: number, oldName: string, newName: string) => {
    const storageKey = getSongKey(song);
    const data = await fetchSongStats(song);

    const newScores = data.scores.map((record) => {
      if (record.setup.id !== singId) return record;

      const newScores = record.scores.map((previousScore) => {
        if (previousScore.name !== oldName || previousScore.score !== score) return previousScore;

        return { name: newName.trim(), score };
      });

      return { ...record, scores: newScores };
    });

    const newData = { ...data, scores: newScores };

    await storeSongStats(song, newData);
    events.songScoreUpdated.dispatch(storageKey, newData, newName.trim());
  };
};

const MIN_SUNG_SONGS = 5;

/** IDs of the songs the player has sung, or an empty list until they've sung at least `MIN_SUNG_SONGS` of them */
export const useSungSongs = () => {
  const [sungSongs, setSungSongs] = useState<string[]>([]);

  const loadSungSongs = async () => {
    const stats = await getAllStats().catch((error: unknown) => {
      console.error(error);
      return {} as Record<string, SongStats>;
    });
    const songIds = Object.keys(stats).filter((key) => (stats[key]?.scores?.length ?? 0) > 0);
    setSungSongs(songIds.length >= MIN_SUNG_SONGS ? songIds : []);
  };

  useEffect(() => {
    loadSungSongs();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once, then refresh on stored stats
  }, []);

  useEventEffect(events.songStatStored, loadSungSongs);

  return sungSongs;
};
