import uFuzzy from '@leeoniya/ufuzzy';
import { SongPreview } from 'interfaces';
import isSongRecentlyUpdated from 'modules/Songs/utils/isSongRecentlyUpdated';
import clearString, { removeAccents } from 'modules/utils/clearString';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ExcludedLanguagesSetting, useSettingValue } from 'routes/Settings/SettingsState';
import { usePlaylists } from 'routes/SingASong/SongSelection/Hooks/usePlaylists';

type FilterFunc = (
  songList: SongPreview[],
  value: any,
  appliedFilters: AppliedFilters,
  list: SongPreview[],
) => SongPreview[];

export interface AppliedFilters {
  yearBefore?: number;
  yearAfter?: number;
  language?: string;
  excludeLanguages?: string[];
  skipExcludedLanguages?: boolean;
  search?: string;
  edition?: string;
  recentlyUpdated?: boolean | null;
  duet?: boolean | null;
  specificSongs?: string[];
  additionalSongs?: string[];
}

const isSearchApplied = (appliedFilters: AppliedFilters) => clearString(appliedFilters?.search ?? '').length > 2;

const emptyFilters: AppliedFilters = {};

const ALPHANUMERIC__SPACE_REGEX = /[^0-9a-z ]/gi;

const getSearchString = (str: string) => removeAccents(str).toLowerCase().replace(ALPHANUMERIC__SPACE_REGEX, '');

export function searchList<T extends Pick<SongPreview, 'artist' | 'title' | 'search'>>(list: T[], search: string): T[] {
  const cleanSearch = clearString(search);

  if (cleanSearch.length > 0) {
    const fuzz = new uFuzzy({});
    const [, info, order] = fuzz.search(
      list.map((song) => `${getSearchString(song.artist)} ${getSearchString(song.title)}`),
      getSearchString(search),
    );
    if (order && info) {
      return order.map((item) => list[info.idx[item]]);
    } else {
      return list.filter((song) => song.search.includes(cleanSearch));
    }
  }

  return list;
}

export const filteringFunctions: Record<keyof AppliedFilters, FilterFunc> = {
  language: (songList, language: string) => {
    if (language === '') return songList;

    return songList.filter((song) => {
      return song.language.includes(language);
    });
  },
  excludeLanguages: (songList, languages: string[] = [], appliedFilters = {}) => {
    if (languages.length === 0 || isSearchApplied(appliedFilters) || appliedFilters.skipExcludedLanguages)
      return songList;

    return songList.filter((song) => {
      return !song.language.every((songLang) => languages.includes(songLang!));
    });
  },
  search: (songList, search: string) => {
    return searchList(songList, search);
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
    return songList.filter(isSongRecentlyUpdated);
  },
  specificSongs: (songList, specificSongs: string[], appliedFilters: AppliedFilters) => {
    if (isSearchApplied(appliedFilters)) return songList;

    return songList.filter((song) => specificSongs.includes(song.id));
  },
  additionalSongs: (songList, additionalSongIds: string[], appliedFilters, list) => {
    const additionalSongs = list.filter((song) => additionalSongIds.includes(song.id));
    return [...songList, ...additionalSongs.filter((song) => !songList.includes(song))];
  },
  skipExcludedLanguages: (songList) => songList,
};

const applyFilters = (list: SongPreview[], appliedFilters: AppliedFilters): SongPreview[] => {
  return Object.entries(appliedFilters)
    .filter((filters): filters is [keyof AppliedFilters, FilterFunc] => filters[0] in filteringFunctions)
    .reduce((songList, [name, value]) => filteringFunctions[name](songList, value, appliedFilters, list), list);
};

export const useSongListFilter = (
  list: SongPreview[],
  popular: string[],
  isLoading: boolean,
  additionalSong: string | null,
) => {
  const [excludedLanguages] = useSettingValue(ExcludedLanguagesSetting);
  const prefilteredList = useMemo(
    () => applyFilters(list, { excludeLanguages: excludedLanguages ?? [] }),
    [list, excludedLanguages],
  );

  const playlists = usePlaylists(prefilteredList, popular, isLoading);

  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(
    new URLSearchParams(global.location?.search).get('playlist') ?? null,
  );

  const setPlaylist = (name: string) => {
    /// push query param to url containing playlist name
    const url = new URL(global.location?.href);
    url.searchParams.set('playlist', name);
    global.history.replaceState(null, '', url.toString());

    setSelectedPlaylist(name);
  };

  const playlist = playlists.find((p) => p.name === selectedPlaylist) ?? playlists[0];
  const [filters, setFilters] = useState<AppliedFilters>(() => emptyFilters);

  useEffect(() => {
    setFilters(emptyFilters);
  }, [selectedPlaylist]);

  const deferredFilters = useDeferredValue(filters);
  const isSearchApplied = !!deferredFilters.search;

  const filteredList = useMemo(
    () =>
      applyFilters(list, {
        ...(playlist?.filters ?? {}),
        ...deferredFilters,
        excludeLanguages: excludedLanguages ?? [],
        additionalSongs: additionalSong ? [additionalSong] : [],
      }),
    [list, deferredFilters, excludedLanguages, playlist, additionalSong, isSearchApplied],
  );

  return { filters, filteredList, setFilters, selectedPlaylist, setSelectedPlaylist: setPlaylist, playlists, playlist };
};
