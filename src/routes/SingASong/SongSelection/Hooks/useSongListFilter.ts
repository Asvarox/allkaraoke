import uFuzzy from '@leeoniya/ufuzzy';
import dayjs from 'dayjs';
import { SongPreview } from 'interfaces';
import clearString, { removeAccents } from 'modules/utils/clearString';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ExcludedLanguagesSetting, useSettingValue } from 'routes/Settings/SettingsState';
import { usePlaylists } from 'routes/SingASong/SongSelection/Hooks/usePlaylists';

type FilterFunc = (songList: SongPreview[], ...args: any) => SongPreview[];

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

const isSearchApplied = (appliedFilters: AppliedFilters) => clearString(appliedFilters?.search ?? '').length > 2;

const emptyFilters: AppliedFilters = {};

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
        songList.map((song) => `${removeAccents(song.artist)} ${removeAccents(song.title)}`),
        removeAccents(search),
      );
      if (order && info) {
        return order.map((item) => songList[info.idx[item]]);
      } else {
        return songList.filter((song) => song.search.includes(cleanSearch));
      }
    }

    return songList;
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
    new URLSearchParams(global.location?.search).get('playlist') ?? null,
  );
  const playlist = playlists.find((p) => p.name === selectedPlaylist) ?? playlists[0];
  const [filters, setFilters] = useState<AppliedFilters>(emptyFilters);

  useEffect(() => {
    setFilters(emptyFilters);
  }, [selectedPlaylist]);

  const deferredFilters = useDeferredValue(filters);

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
