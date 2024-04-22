import uFuzzy from '@leeoniya/ufuzzy';
import { captureException } from '@sentry/react';
import { ExcludedLanguagesSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import { usePlaylists } from 'Scenes/SingASong/SongSelectionVirtualized/Hooks/usePlaylists';
import useRecommendedSongs from 'Scenes/SingASong/SongSelectionVirtualized/Hooks/useRecommendedSongs';
import useSongIndex from 'Songs/hooks/useSongIndex';
import dayjs from 'dayjs';
import { SongPreview } from 'interfaces';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import clearString from 'utils/clearString';

export interface SongGroup {
  name: string;
  songs: Array<{ index: number; song: SongPreview; isPopular: boolean }>;
  isNew?: boolean;
}

export interface AppliedFilters {
  yearBefore?: number;
  yearAfter?: number;
  language?: string;
  excludeLanguages?: string[];
  search?: string;
  edition?: string;
  recentlyUpdated?: boolean | null;
  duet?: boolean | null;
  specificSongs?: string[];
}

type FilterFunc = (songList: SongPreview[], ...args: any) => SongPreview[];

const isSearchApplied = (appliedFilters: AppliedFilters) => clearString(appliedFilters?.search ?? '').length > 2;

const emptyFilters: AppliedFilters = {};

const groupSongsByLetter = (song: SongPreview) => {
  const nonAlphaRegex = /[^a-zA-Z]/;

  return isFinite(+song.artist[0]) || nonAlphaRegex.test(song.artist[0]) ? '0-9' : song.artist[0].toUpperCase();
};

export const filteringFunctions: Record<keyof AppliedFilters, FilterFunc> = {
  language: (songList, language: string) => {
    if (language === '') return songList;

    return songList.filter((song) => {
      return song.language.includes(language);
    });
  },
  excludeLanguages: (songList, languages: string[] = [], appliedFilters: AppliedFilters) => {
    if (languages.length === 0 || isSearchApplied(appliedFilters) || appliedFilters.edition === 'esc') return songList;

    return songList.filter((song) => {
      return !song.language.every((songLang) => languages.includes(songLang!));
    });
  },
  search: (songList, search: string) => {
    const cleanSearch = clearString(search);

    if (cleanSearch.length > 0) {
      const fuzz = new uFuzzy({});
      const [, info, order] = fuzz.search(
        songList.map((song) => `${clearString(song.artist)} ${clearString(song.title)}`),
        search,
      );
      if (order && info) {
        return order.map((item) => songList[info.idx[item]]);
      }
    }

    return cleanSearch.length > 0 ? songList.filter((song) => song.search.includes(cleanSearch)) : songList;
  },
  duet: (songList, duet: boolean | null) => {
    if (duet === null) return songList;

    return songList.filter((song) => (duet ? song.tracksCount > 1 : song.tracksCount === 1));
  },
  yearBefore: (songList, yearBefore: number) => {
    if (!yearBefore) return songList;

    return songList.filter((song) => Number(song.year) < yearBefore);
  },
  yearAfter: (songList, yearAfter: number) => {
    if (!yearAfter) return songList;

    return songList.filter((song) => Number(song.year) >= yearAfter);
  },
  edition: (songList, edition: string) => {
    const cleanEdition = clearString(edition);

    return cleanEdition.length
      ? songList.filter((song) => clearString(song.edition ?? '').includes(edition))
      : songList;
  },
  recentlyUpdated: (songList) => {
    const after = dayjs().subtract(31, 'days');

    return songList.filter((song) => song.lastUpdate && dayjs(song.lastUpdate).isAfter(after));
  },
  specificSongs: (songList, specificSongs: string[], appliedFilters: AppliedFilters) => {
    if (isSearchApplied(appliedFilters)) return songList;

    return songList.filter((song) => specificSongs.includes(song.id));
  },
};

const applyFilters = (list: SongPreview[], appliedFilters: AppliedFilters): SongPreview[] => {
  return Object.entries(appliedFilters)
    .filter((filters): filters is [keyof AppliedFilters, FilterFunc] => filters[0] in filteringFunctions)
    .reduce((songList, [name, value]) => filteringFunctions[name](songList, value, appliedFilters, list), list);
};

export const useSongListFilter = (list: SongPreview[], popular: string[], isLoading: boolean) => {
  const [excludedLanguages] = useSettingValue(ExcludedLanguagesSetting);
  const prefilteredList = useMemo(
    () => applyFilters(list, { excludeLanguages: excludedLanguages ?? [] }),
    [list, excludedLanguages],
  );

  const playlists = usePlaylists(prefilteredList, popular, isLoading);

  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(
    new URLSearchParams(window.location.search).get('playlist') ?? null,
  );
  const [filters, setFilters] = useState<AppliedFilters>(emptyFilters);

  useEffect(() => {
    setFilters(emptyFilters);
  }, [selectedPlaylist]);

  const deferredFilters = useDeferredValue(filters);

  const playlist = playlists.find((p) => p.name === selectedPlaylist) ?? playlists[0];

  const filteredList = useMemo(
    () =>
      applyFilters(list, {
        ...(playlist?.filters ?? {}),
        ...deferredFilters,
        excludeLanguages: excludedLanguages ?? [],
      }),
    [list, deferredFilters, excludedLanguages, playlist],
  );

  return { filters, filteredList, setFilters, selectedPlaylist, setSelectedPlaylist, playlists, playlist };
};

export default function useSongList() {
  const songList = useSongIndex();
  const {
    value: { popular },
    loading,
  } = useRecommendedSongs(songList.data);

  const isLoading = songList.isLoading || loading;

  const { filters, filteredList, setFilters, selectedPlaylist, setSelectedPlaylist, playlists, playlist } =
    useSongListFilter(songList.data, popular, isLoading);

  const groupedSongList = useMemo(() => {
    if (filteredList.length === 0) return [];

    const groups: SongGroup[] = [];

    if (filters.search) {
      groups.push({
        name: 'Search results',
        songs: filteredList.map((song, index) => ({ index, song, isPopular: popular.includes(song.id) })),
      });
    } else {
      if (!playlist?.hideNew) {
        const newSongs = filteredList.filter((song) => song.isNew);

        if (newSongs.length && newSongs.length < 50) {
          groups.push({
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

      const sortedList = playlist?.sortingFn ? [...filteredList].sort(playlist.sortingFn) : filteredList;

      sortedList.forEach((song) => {
        try {
          const groupName = (playlist?.groupingFn ?? groupSongsByLetter)(song);
          let group = groups.find((group) => group.name === groupName);
          if (!group) {
            group = { name: groupName, songs: [] };
            groups.push(group);
          }

          group.songs.push({ index: filteredList.indexOf(song), song, isPopular: popular.includes(song.id) });
        } catch (e) {
          console.error(e);
          captureException(e);
        }
      });
    }

    return groups;
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
