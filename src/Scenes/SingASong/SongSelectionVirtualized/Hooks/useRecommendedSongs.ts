import { ExcludedLanguagesSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import { filteringFunctions } from 'Scenes/SingASong/SongSelectionVirtualized/Hooks/useSongList';
import { getAllStats } from 'Songs/stats/common';
import { SongPreview } from 'interfaces';
import { useMemo } from 'react';
import { useAsync } from 'react-use';

const POPULAR_SONGS_MIN_COUNT = 250;
const POPULAR_SONGS_MAX_COUNT = 750;

export default function useRecommendedSongs(songs: SongPreview[]) {
  const popularSongs = useAsync(
    async () => (await fetch(`/mostPopularSongs.json`)).json() as Promise<Record<string, string[]>>,
    [],
  );
  const sungSongs = useAsync(async () => getAllStats(), []);
  const recentlyUpdatedSongs = useMemo(() => filteringFunctions.recentlyUpdated(songs), [songs]).map((song) => song.id);
  const [excludedLanguages] = useSettingValue(ExcludedLanguagesSetting);

  const loading = popularSongs.loading || sungSongs.loading || !songs.length;

  const value = useMemo(() => {
    if (loading) return undefined;

    const actuallySungSongs = Object.keys(sungSongs.value!).filter((song) =>
      sungSongs.value![song].scores.some((score) => (score.progress ?? 0) > 0.8),
    );

    const popularSongLanguages = Object.keys(popularSongs.value!).filter(
      (language) => !excludedLanguages?.includes(language),
    );
    // get the list of languages that we don't want to include in the first run:
    // 1. Languages that have popularity index - as the amount of songs to be taken can vary by how many we already have to take
    // 2. Languages excluded by the player
    const languagesToExclude = [...new Set([...popularSongLanguages, ...(excludedLanguages ?? [])])];

    // Get the local songs, songs in player languages that are not excluded and songs that the player sung
    const songsToAdd = songs
      .filter((song) => !languagesToExclude.some((language) => song.language.includes(language)) || song.local)
      .map((song) => song.id)
      .concat(...actuallySungSongs);

    // Given how many songs we already have, compute how many songs to take from each language
    const popularSongsCount = Math.max(
      POPULAR_SONGS_MIN_COUNT,
      POPULAR_SONGS_MAX_COUNT - Math.round(songsToAdd.length / 1.75),
    );

    const finalPopularSongs = popularSongLanguages
      .map((language) => popularSongs.value![language].slice(0, popularSongsCount))
      .flat();

    return {
      popular: [...new Set([...actuallySungSongs, ...finalPopularSongs, ...songsToAdd, ...recentlyUpdatedSongs])],
    };
  }, [excludedLanguages, loading, popularSongs.value, songs, sungSongs.value]);

  const defaultValue = useMemo(() => ({ popular: [] }), []);

  return { value: value ?? defaultValue, loading };
}
