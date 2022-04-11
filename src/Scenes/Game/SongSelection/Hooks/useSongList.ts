import { uniq } from 'lodash';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { SongPreview } from '../../../../interfaces';
import clearString from '../../../../Utils/clearString';

export interface SongGroup {
    letter: string;
    songs: Array<{ index: number; song: SongPreview }>;
}

export interface AppliedFilters {
    language?: string;
    search?: string;
    duet?: boolean | null;
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
    const songList = useQuery<SongPreview[]>('songList', () =>
        fetch('./songs/index.json').then((response) => response.json()),
    );
    const { filters, filtersData, filteredList, setFilters } = useSongListFilter(songList.data ?? []);
    const groupedSongList = useMemo(() => {
        if (filteredList.length === 0) return [];

        const groups: SongGroup[] = [];

        filteredList.forEach((song, index) => {
            const firstCharacter = isFinite(+song.artist[0]) ? '0-9' : song.artist[0].toUpperCase();
            let group = groups.find((group) => group.letter === firstCharacter);
            if (!group) {
                group = { letter: firstCharacter, songs: [] };
                groups.push(group);
            }

            group.songs.push({ index, song });
        });

        return groups;
    }, [filteredList]);

    return {
        groupedSongList,
        songList: filteredList,
        filtersData,
        filters,
        setFilters,
    };
}
