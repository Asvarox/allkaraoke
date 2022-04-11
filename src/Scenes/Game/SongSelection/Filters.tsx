import { useRef } from 'react';
import styled from 'styled-components';
import useKeyboard from '../../../Hooks/useKeyboard';
import { AppliedFilters, FiltersData } from './Hooks/useSongList';
import { Input } from './Input';
import { Switcher } from './Switcher';

interface Props {
    onSongFiltered: (filters: AppliedFilters) => void;
    filtersData: FiltersData;
    filters: AppliedFilters;
    onBack: () => void;
}
export default function Filters({ filtersData, onSongFiltered, onBack, filters }: Props) {
    const selectedLanguage = filtersData.language.current;

    const { register } = useKeyboard(true, onBack);

    const cycleLanguage = () => {
        const index = filtersData.language.available.indexOf(selectedLanguage);

        onSongFiltered({
            ...filters,
            language: filtersData.language.available[(index + 1) % filtersData.language.available.length],
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
        <Container>
            <FilterItem>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        searchInput.current?.blur();
                    }}>
                    <Input
                        {...register('search', () => {
                            searchInput.current?.focus();
                        })}
                        label="Search"
                        value={filters.search ?? ''}
                        onChange={setSearch}
                        ref={searchInput}
                    />
                </form>
            </FilterItem>
            <FilterItem>
                <Switcher {...register('language', cycleLanguage)} label="Language" value={selectedLanguage || 'All'} />
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

const FilterItem = styled.div`
    flex: 1;
`;
