import { filteringFunctions } from 'Scenes/SingASong/SongSelection/Hooks/useSongList';
import FavoritesService from 'Songs/FavoritesService';
import { getAllStats } from 'Songs/stats/common';
import { SongPreview } from 'interfaces';
import { useFeatureFlagEnabled } from 'posthog-js/react';
import { useEffect, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { FeatureFlags } from 'utils/featureFlags';

function useFavorites() {
  const enabled = useFeatureFlagEnabled(FeatureFlags.Favorites);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Record<string, boolean | undefined>>({});

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const onUpdate = (songId: string, state: boolean) => {
      setFavorites((prev) => ({ ...prev, [songId]: state }));
    };
    FavoritesService.getAll().then((favorites) => {
      setFavorites(favorites);
      setLoading(false);
    });

    FavoritesService.addListener(onUpdate);
    return () => {
      FavoritesService.removeListener(onUpdate);
    };
  }, [enabled]);

  return { value: favorites, loading };
}

export default function useRecommendedSongs(songs: SongPreview[]) {
  const popularSongs = useAsync(
    async () => (await fetch(`/mostPopularSongs.json`)).json() as Promise<Record<string, string[]>>,
    [],
  );
  const favorites = useFavorites();
  const sungSongs = useAsync(async () => getAllStats(), []);
  const recentlyUpdatedSongs = useMemo(() => filteringFunctions.recentlyUpdated(songs), [songs]).map((song) => song.id);

  const loading = popularSongs.loading || favorites.loading || sungSongs.loading || !songs.length;

  const value = useMemo(() => {
    if (loading) return undefined;
    const popularSongLanguages = Object.keys(popularSongs.value!);
    const finalPopularSongs = popularSongLanguages
      .map((language) => {
        return popularSongs.value![language].filter((song) => favorites.value![song] !== false);
      })
      .flat();
    const languagesToExclude = [...new Set([...finalPopularSongs, ...popularSongLanguages])];
    const songsToAdd = songs
      .filter((song) => !languagesToExclude.some((language) => song.language.includes(language)) || song.local)
      .map((song) => song.id)
      .filter((song) => favorites.value![song] !== false);
    const favoriteSongs = Object.keys(favorites.value!).filter((song) => favorites.value![song] === true);

    const actuallySungSongs = Object.keys(sungSongs.value!).filter((song) =>
      sungSongs.value![song].scores.some((score) => (score.progress ?? 0) > 0.8),
    );

    return {
      popular: [
        ...new Set([
          ...actuallySungSongs,
          ...finalPopularSongs,
          ...favoriteSongs,
          ...songsToAdd,
          ...recentlyUpdatedSongs,
        ]),
      ],
      favorites: favorites.value,
    };
  }, [favorites.value, loading, popularSongs.value, songs, sungSongs.value]);

  const defaultValue = useMemo(() => ({ popular: [], favorites: {} as Record<string, boolean> }), []);

  return { value: value ?? defaultValue, loading };
}
