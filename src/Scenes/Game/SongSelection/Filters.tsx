import { REGULAR_ALPHA_CHARS } from 'hooks/useKeyboard';
import useKeyboardNav from 'hooks/useKeyboardNav';
import usePrevious from 'hooks/usePrevious';
import { useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { SongListEntryDetails } from 'Scenes/Game/SongSelection/SongCard';
import styled from 'styled-components';
import { AppliedFilters, FiltersData } from './Hooks/useSongList';
import { Input } from './Input';
import { nextValue, Switcher } from './Switcher';

interface Props {
    onSongFiltered: (filters: AppliedFilters) => void;
    filtersData: FiltersData;
    filters: AppliedFilters;
    showFilters: boolean;
    onBack: () => void;
}
export default function Filters({ filtersData, onSongFiltered, onBack, filters, showFilters }: Props) {
    const searchInput = useRef<HTMLInputElement | null>(null);

    const onLeave = () => {
        onBack();
        searchInput.current?.blur();
    };

    const { register, focusElement, focused } = useKeyboardNav({
        onBackspace: onLeave,
        direction: 'horizontal',
        enabled: showFilters,
        additionalHelp: { letterF: 'Return to Song List' },
    });
    useHotkeys('down', onLeave, { enabled: showFilters, enableOnTags: ['INPUT'] });

    const selectedLanguage = filtersData.language.current;
    const cycleLanguage = () => {
        onSongFiltered({
            ...filters,
            language: nextValue(filtersData.language.available, selectedLanguage),
        });
    };

    const selectedDuet = filters.duet ?? null;
    const duetLabel = selectedDuet === null ? 'Any' : selectedDuet ? 'Duet' : 'Single Track';
    const cycleDuet = () => {
        const cycle = [null, true, false];

        onSongFiltered({
            ...filters,
            duet: nextValue(cycle, selectedDuet),
        });
    };

    const focusSearch = () => {
        searchInput.current?.focus();
        focusElement('search');
    };

    useHotkeys(REGULAR_ALPHA_CHARS, focusSearch, { enabled: focused === 'search' });

    const previousShowFilters = usePrevious(showFilters);
    useEffect(() => {
        // Hacky and buggy way to detect if someone started filtering by inputting a letter
        if (!previousShowFilters && showFilters && filters.search?.length === 1) {
            focusSearch();
        }
    }, [previousShowFilters, showFilters, focusElement, filters.search, searchInput.current]);
    const setSearch = (value: string) => {
        onSongFiltered({
            ...filters,
            search: value,
        });
    };

    return (
        <Container data-test="song-list-filters">
            <FilterItem large>
                <form
                    data-test="filters-search-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        searchInput.current?.blur();
                    }}>
                    <Input
                        {...register(
                            'search',
                            () => {
                                searchInput.current?.focus();
                            },
                            'Search song',
                        )}
                        label="Search"
                        value={filters.search ?? ''}
                        onChange={setSearch}
                        ref={searchInput}
                        data-test="filters-search"
                    />
                </form>
            </FilterItem>
            <FilterItem>
                <Switcher
                    {...register('language', cycleLanguage, 'Toggle language')}
                    label="Language"
                    value={selectedLanguage || 'All'}
                    data-test="filters-language"
                />
            </FilterItem>
            <FilterItem>
                <Switcher
                    {...register('duet', cycleDuet, 'Toggle duet')}
                    label="Duet?"
                    value={duetLabel}
                    data-test="filters-duet"
                />
            </FilterItem>
            <SongCount>
                {filtersData.status.visible}/{filtersData.status.allSongs}
            </SongCount>
        </Container>
    );
}

const Container = styled.div`
    background: rgba(0, 0, 0, 0.7);
    padding: 20px;
    width: 100%;
    font-size: 30px;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    gap: 20px;
`;

const FilterItem = styled.div<{ large?: boolean }>`
    flex: ${(props) => (props.large ? 1.5 : 1)};
`;

const SongCount = styled(SongListEntryDetails)`
    height: 1em;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.25em;
`;
