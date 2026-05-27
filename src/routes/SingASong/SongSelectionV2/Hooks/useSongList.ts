import { captureException } from '@sentry/react';
import { ReactNode, useMemo } from 'react';
import { SongPreview } from '~/interfaces';
import useSongIndex from '~/modules/Songs/hooks/useSongIndex';
import useRecommendedSongs from '~/routes/SingASong/SongSelectionV2/Hooks/useRecommendedSongs';
import { useSongListFilter } from '~/routes/SingASong/SongSelectionV2/Hooks/useSongListFilter';
import useSharedSongsSearch from '~/routes/SingASong/SongSelectionV2/Hooks/useSharedSongsSearch';

export interface SongGroup {
  name: string;
  displayShort?: ReactNode;
  displayLong?: ReactNode;
  songs: Array<{ index: number; song: SongPreview; isPopular: boolean }>;
  isNew?: boolean;
}

const groupSongsByLetter = (song: SongPreview): Pick<SongGroup, 'name'> => {
  const nonAlphaRegex = /[^a-zA-Z]/;

  return {
    name: isFinite(+song.artist[0]) || nonAlphaRegex.test(song.artist[0]) ? '0-9' : song.artist[0].toUpperCase(),
  };
};

/**
 * @param additionalSong - If provided, the song will be added to the song list and preselected. So e.g. when list contains only polish songs and user remotely selects english song, it will be added to the list and actually selected
 */
export default function useSongList(additionalSong: string | null) {
  const songList = useSongIndex();
  const {
    value: { popular },
    loading,
  } = useRecommendedSongs(songList.data);

  const isLoading = songList.isLoading || loading;

  const { filters, filteredList, setFilters, selectedPlaylist, setSelectedPlaylist, playlists, playlist } =
    useSongListFilter(songList.data, popular, isLoading, additionalSong);

  const existingSongIds = useMemo(() => new Set(songList.data.map((song) => song.id)), [songList.data]);
  const sharedSongs = useSharedSongsSearch({
    searchText: filters.search ?? '',
    regularResultsCount: filteredList.length,
    fallbackThreshold: 8,
    existingSongIds,
  });

  const mergedSearchList = useMemo(
    () => (filters.search ? [...filteredList, ...sharedSongs] : filteredList),
    [filters.search, filteredList, sharedSongs],
  );

  const groupedSongList = useMemo(() => {
    const groups: SongGroup[] = [];

    if (filters.search) {
      groups.push({
        name: 'Search results',
        songs: filteredList.map((song, index) => ({ index, song, isPopular: popular.includes(song.id) })),
      });

      if (sharedSongs.length > 0) {
        groups.push({
          name: 'Shared songs (unverified)',
          songs: sharedSongs.map((song, index) => ({
            index: filteredList.length + index,
            song,
            isPopular: false,
          })),
        });
      }

      return groups;
    } else {
      if (filteredList.length === 0) return [];
      const sortedList = playlist?.sortingFn ? [...filteredList].sort(playlist.sortingFn) : filteredList;

      // Precompute a map from song id to its index in filteredList to avoid O(n²) indexOf calls
      const songIndexMap = new Map(filteredList.map((song, index) => [song.id, index]));

      sortedList.forEach((song) => {
        try {
          const { name, ...rest } = (playlist?.groupData ?? groupSongsByLetter)(song);
          let group = groups.find((group) => group.name === name);
          if (!group) {
            group = { name, songs: [], ...rest };
            groups.push(group);
          }

          group.songs.push({ index: songIndexMap.get(song.id) ?? 0, song, isPopular: popular.includes(song.id) });
        } catch (e) {
          console.error(e);
          captureException(e);
        }
      });

      const finalGroups = playlist?.postGrouping?.(groups) ?? groups;

      if (!playlist?.hideNew) {
        const newSongs = filteredList.filter((song) => song.isNew);

        if (newSongs.length && newSongs.length < 50) {
          finalGroups.unshift({
            name: 'New',
            isNew: true,
            songs: newSongs.map((song) => ({
              song,
              index: songIndexMap.get(song.id) ?? 0,
              isPopular: popular.includes(song.id),
            })),
          });
        }
      }

      return finalGroups;
    }
  }, [filteredList, filters.search, popular, playlist, sharedSongs]);

  return {
    groupedSongList,
    songList: mergedSearchList,
    filters,
    setFilters,
    isLoading,
    selectedPlaylist,
    setSelectedPlaylist,
    playlists,
  };
}
