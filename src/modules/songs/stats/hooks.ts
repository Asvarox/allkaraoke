import { useEffect, useState } from 'react';
import { SongPreview } from '~/interfaces';
import events from '~/modules/game-events/game-events';
import { useEventEffect } from '~/modules/game-events/hooks';
import { SongStats, fetchSongStats, getSongKey, storeSongStats } from '~/modules/songs/stats/common';

export const useSongStats = (song: Pick<SongPreview, 'artist' | 'title'>) => {
  const [stats, setStats] = useState<SongStats | null>(null);

  const storageKey = getSongKey(song);

  const setSongStats = async () => {
    setStats(await fetchSongStats(song));
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
