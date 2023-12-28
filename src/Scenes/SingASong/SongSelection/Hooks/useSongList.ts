import { captureException } from '@sentry/react';
import { ExcludedLanguagesSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import { usePlaylists } from 'Scenes/SingASong/SongSelection/Hooks/usePlaylists';
import useSongIndex from 'Songs/hooks/useSongIndex';
import dayjs from 'dayjs';
import { SongPreview } from 'interfaces';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import clearString from 'utils/clearString';

export interface SongGroup {
  letter: string;
  songs: Array<{ index: number; song: SongPreview }>;
  isNew?: boolean;
}

export interface AppliedFilters {
  yearBefore?: number;
  yearAfter?: number;
  language?: string;
  excludeLanguages?: string[];
  search?: string;
  edition?: string;
  updatedAfter?: string;
  duet?: boolean | null;
}

type FilterFunc = (songList: SongPreview[], ...args: any) => SongPreview[];

const filteringFunctions: Record<keyof AppliedFilters, FilterFunc> = {
  language: (songList, language: string) => {
    if (language === '') return songList;

    return songList.filter((song) => {
      const songLangs = Array.isArray(song.language) ? song.language : [song.language!];

      return songLangs.includes(language);
    });
  },
  excludeLanguages: (songList, languages: string[] = [], appliedFilters: AppliedFilters) => {
    if (languages.length === 0 || clearString(appliedFilters?.search ?? '').length > 2) return songList;

    return songList.filter((song) => {
      const songLangs = Array.isArray(song.language) ? song.language : [song.language!];

      return !songLangs.every((songLang) => languages.includes(songLang!));
    });
  },
  search: (songList, search: string) => {
    const cleanSearch = clearString(search);

    return cleanSearch.length > 2 ? songList.filter((song) => song.search.includes(cleanSearch)) : songList;
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

    return cleanEdition.length ? songList.filter((song) => clearString(song.edition ?? '') === edition) : songList;
  },
  updatedAfter: (songList, after: string) => {
    if (!after) return songList;
    const dateAfter = dayjs(after);

    return songList.filter((song) => song.lastUpdate && dayjs(song.lastUpdate).isAfter(dateAfter));
  },
};

const applyFilters = (list: SongPreview[], appliedFilters: AppliedFilters): SongPreview[] => {
  return Object.entries(appliedFilters)
    .filter((filters): filters is [keyof AppliedFilters, FilterFunc] => filters[0] in filteringFunctions)
    .reduce((songList, [name, value]) => filteringFunctions[name](songList, value, appliedFilters), list);
};

export const useSongListFilter = (list: SongPreview[]) => {
  const [excludedLanguages] = useSettingValue(ExcludedLanguagesSetting);
  const prefilteredList = useMemo(
    () => applyFilters(list, { excludeLanguages: excludedLanguages ?? [] }),
    [list, excludedLanguages],
  );

  const playlists = usePlaylists(prefilteredList);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(
    new URLSearchParams(window.location.search).get('playlist') ?? null,
  );

  const [filters, setFilters] = useState<AppliedFilters>({});

  useEffect(() => {
    setFilters({});
  }, [selectedPlaylist]);

  const deferredFilters = useDeferredValue(filters);

  const playlistFilters = playlists.find((p) => p.name === selectedPlaylist)?.filters ?? null;

  const filteredList = useMemo(
    () =>
      applyFilters(list, {
        ...playlistFilters,
        ...deferredFilters,
        excludeLanguages: excludedLanguages ?? [],
      }),
    [list, deferredFilters, excludedLanguages, playlistFilters],
  );

  return { filters, filteredList, setFilters, selectedPlaylist, setSelectedPlaylist, playlists };
};

export default function useSongList() {
  const songList = useSongIndex();

  const { filters, filteredList, setFilters, selectedPlaylist, setSelectedPlaylist, playlists } = useSongListFilter(
    songList.data,
  );

  const groupedSongList = useMemo(() => {
    if (filteredList.length === 0) return [];

    const groups: SongGroup[] = [];

    // a hack for !filters.edition - due to a bug where selecting a song will make it look selected for both
    // new and regular entry in the list. On Christmas, where most of the songs are new, it looks weird.
    // When the bug is fixed, this can be removed.
    if (!filters.search && !filters.edition) {
      const newSongs = filteredList.filter((song) => song.isNew);

      if (newSongs.length && newSongs.length < 50) {
        groups.push({
          letter: 'New',
          isNew: true,
          songs: newSongs.map((song) => ({
            song,
            index: filteredList.indexOf(song),
          })),
        });
      }
    }

    const nonAlphaRegex = /[^a-zA-Z]/;

    filteredList.forEach((song, index) => {
      try {
        const firstCharacter =
          isFinite(+song.artist[0]) || nonAlphaRegex.test(song.artist[0]) ? '0-9' : song.artist[0].toUpperCase();
        let group = groups.find((group) => group.letter === firstCharacter);
        if (!group) {
          group = { letter: firstCharacter, songs: [] };
          groups.push(group);
        }

        group.songs.push({ index: index, song });
      } catch (e) {
        console.error(e);
        captureException(e);
      }
    });

    return groups;
  }, [filteredList, filters.search]);

  return {
    groupedSongList,
    songList: filteredList,
    filters,
    setFilters,
    isLoading: songList.isLoading,
    selectedPlaylist,
    setSelectedPlaylist,
    playlists,
  };
}
