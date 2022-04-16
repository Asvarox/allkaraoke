import { useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import styled from 'styled-components';
import useKeyboard from '../../../Hooks/useKeyboard';
import { AppliedFilters, FiltersData } from './Hooks/useSongList';
import { Input } from './Input';
import { Switcher } from './Switcher';

interface Props {
    onSongFiltered: (filters: AppliedFilters) => void;
    filtersData: FiltersData;
    filters: AppliedFilters;
    showFilters: boolean;
    onBack: () => void;
}
export default function Filters({ filtersData, onSongFiltered, onBack, filters, showFilters }: Props) {
    const { register } = useKeyboard({
        onBackspace: onBack,
        direction: 'horizontal',
        enabled: showFilters,
        additionalHelp: { letterF: 'Return to Song List' },
    });
    useHotkeys('down', onBack, { enabled: showFilters });

    const selectedLanguage = filtersData.language.current;
    const cycleLanguage = () => {
        const index = filtersData.language.available.indexOf(selectedLanguage);

        onSongFiltered({
            ...filters,
            language: filtersData.language.available[(index + 1) % filtersData.language.available.length],
        });
    };

    const selectedDuet = filters.duet ?? null;
    const duetLabel = selectedDuet === null ? 'Any' : selectedDuet ? 'Duet' : 'Single Track';
    const cycleDuet = () => {
        const cycle = [null, true, false];
        const index = cycle.indexOf(selectedDuet);

        onSongFiltered({
            ...filters,
            duet: cycle[(index + 1) % cycle.length],
        });
    };

    const searchInput = useRef<HTMLInputElement | null>(null);
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
