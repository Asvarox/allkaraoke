import useSongIndex from 'Songs/hooks/useSongIndex';
import { SongPreview } from 'interfaces';
import { uniq } from 'lodash-es';
import { useMemo, useState } from 'react';
import clearString from '../../../../utils/clearString';

export interface SongGroup {
    letter: string;
    songs: Array<{ index: number; song: SongPreview }>;
    isNew?: boolean;
}

export interface AppliedFilters {
    yearBefore?: number;
    yearAfter?: number;
    language?: string;
    search?: string;
    duet?: boolean | null;
}

export function isEmptyFilters(filters: AppliedFilters) {
    return (
        (!filters.language || filters.language === '') &&
        (!filters.search || filters.search === '') &&
        (filters.duet === undefined || filters.duet === null) &&
        !filters.yearBefore &&
        !filters.yearAfter
    );
}

export interface FiltersData {
    language: {
        current: string;
        available: string[];
    };
    status: {
        allSongs: number;
        visible: number;
    };
}

type FilterFunc = (songList: SongPreview[], ...args: any) => SongPreview[];

const filteringFunctions: Record<keyof AppliedFilters, FilterFunc> = {
    language: (songList, language: string) => {
        if (language === '') return songList;
        const filterValue = language === 'Unknown' ? undefined : language;

        return songList.filter((song) => song.language === filterValue);
    },
    search: (songList, search: string) => {
        const cleanSearch = clearString(search);

        return cleanSearch.length ? songList.filter((song) => song.search.includes(cleanSearch)) : songList;
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
};

const applyFilters = (list: SongPreview[], filters: AppliedFilters): SongPreview[] => {
    return Object.entries(filters)
        .filter((filters): filters is [keyof AppliedFilters, FilterFunc] => filters[0] in filteringFunctions)
        .reduce((songList, [name, value]) => filteringFunctions[name](songList, value), list);
};

const useLanguageFilter = (list: SongPreview[]) => {
    return useMemo(() => uniq(['', ...list.map((song) => song.language ?? 'Unknown')]), [list]);
};

export const useSongListFilter = (list: SongPreview[]) => {
    const availableLanguages = useLanguageFilter(list);

    const [filters, setFilters] = useState<AppliedFilters>({});

    const filteredList = useMemo(() => applyFilters(list, filters), [list, filters]);

    const filtersData: FiltersData = {
        language: {
            current: filters.language ?? '',
            available: availableLanguages,
        },
        status: {
            allSongs: list.length,
            visible: filteredList.length,
        },
    };

    return { filters, filteredList, filtersData, setFilters };
};

export default function useSongList() {
    const songList = useSongIndex();

    const { filters, filtersData, filteredList, setFilters } = useSongListFilter(songList.data);

    const groupedSongList = useMemo(() => {
        if (filteredList.length === 0) return [];

        const groups: SongGroup[] = [];

        if (!filters.search) {
            const newSongs = filteredList.filter((song) => song.isNew);

            if (newSongs.length) {
                groups.push({
                    letter: 'New',
                    isNew: true,
                    songs: newSongs.map((song) => ({ song, index: filteredList.indexOf(song) })),
                });
            }
        }

        filteredList.forEach((song, index) => {
            const firstCharacter = isFinite(+song.artist[0]) ? '0-9' : song.artist[0].toUpperCase();
            let group = groups.find((group) => group.letter === firstCharacter);
            if (!group) {
                group = { letter: firstCharacter, songs: [] };
                groups.push(group);
            }

            group.songs.push({ index: index, song });
        });

        return groups;
    }, [filteredList, filters.search]);

    return {
        groupedSongList,
        songList: filteredList,
        filtersData,
        filters,
        setFilters,
        isLoading: songList.isLoading,
    };
}
