import { captureException } from '@sentry/react';
import { ReactNode, useMemo } from 'react';
import { SongPreview } from '~/interfaces';
import useSongIndex from '~/modules/Songs/hooks/useSongIndex';
import useRecommendedSongs from '~/routes/SingASong/SongSelection/Hooks/useRecommendedSongs';
import { useSongListFilter } from '~/routes/SingASong/SongSelection/Hooks/useSongListFilter';

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

  const groupedSongList = useMemo(() => {
    const groups: SongGroup[] = [];

    if (filters.search) {
      groups.push({
        name: 'Search results',
        songs: filteredList.map((song, index) => ({ index, song, isPopular: popular.includes(song.id) })),
      });

      return groups;
    } else {
      if (filteredList.length === 0) return [];
      const sortedList = playlist?.sortingFn ? [...filteredList].sort(playlist.sortingFn) : filteredList;

      sortedList.forEach((song) => {
        try {
          const { name, ...rest } = (playlist?.groupData ?? groupSongsByLetter)(song);
          let group = groups.find((group) => group.name === name);
          if (!group) {
            group = { name, songs: [], ...rest };
            groups.push(group);
          }

          group.songs.push({ index: filteredList.indexOf(song), song, isPopular: popular.includes(song.id) });
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
              index: filteredList.indexOf(song),

              isPopular: popular.includes(song.id),
            })),
          });
        }
      }

      return finalGroups;
    }
  }, [filteredList, filters.search, popular, playlist]);

  return {
    groupedSongList,
    songList: filteredList,
    filters,
    setFilters,
    isLoading,
    selectedPlaylist,
    setSelectedPlaylist,
    playlists,
  };
}
