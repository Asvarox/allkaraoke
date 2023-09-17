import events from 'GameEvents/GameEvents';
import { useEventEffect } from 'GameEvents/hooks';
import { SongStats, fetchSongStats, getSongKey, storeSongStats } from 'Songs/stats/common';
import { SongPreview } from 'interfaces';
import { useEffect, useState } from 'react';

export const useSongStats = (song: Pick<SongPreview, 'artist' | 'title'>) => {
  const [stats, setStats] = useState<SongStats | null>(null);

  const storageKey = getSongKey(song);

  const setSongStats = async () => {
    setStats(await fetchSongStats(song));
  };

  useEffect(() => {
    setSongStats();
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
