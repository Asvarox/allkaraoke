import styled from '@emotion/styled';
import { Input } from 'Elements/Input';
import { REGULAR_ALPHA_CHARS } from 'hooks/useKeyboard';
import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { AppliedFilters } from './Hooks/useSongList';

interface Props {
    onSongFiltered: (filters: AppliedFilters) => void;
    filters: AppliedFilters;
    showFilters: boolean;
}
export default function QuickSearch({ onSongFiltered, filters }: Props) {
    const searchInput = useRef<HTMLInputElement | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    const onLeave = () => {
        searchInput.current?.blur();
    };

    useHotkeys('down', onLeave, { enabled: isFocused, enableOnTags: ['INPUT'] });

    const focusSearch = (key?: string) => {
        const searchLength = filters.search?.length ?? 0;
        if (searchLength > 1) {
            onSongFiltered({
                ...filters,
                search: ' ',
            });
        } else if (searchLength === 0 && key) {
            onSongFiltered({
                ...filters,
                search: key,
            });
        }

        searchInput.current?.focus();
    };

    useHotkeys(
        REGULAR_ALPHA_CHARS,
        (e) => {
            focusSearch(e.key);
        },
        { enabled: !isFocused },
    );

    useHotkeys(
        'Backspace',
        (e) => {
            focusSearch();
        },
        { enabled: !isFocused },
    );
    const setSearch = (value: string) => {
        onSongFiltered({
            ...filters,
            search: value.trim(),
        });
    };

    useEffect(() => {
        searchInput.current?.focus();
    }, [searchInput]);

    return (
        <Container data-test="song-list-search">
            <FilterItem large>
                <form
                    data-test="filters-search-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        searchInput.current?.blur();
                    }}>
                    <Input
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        focused={isFocused}
                        label="Search"
                        value={filters.search ?? ''}
                        onChange={setSearch}
                        ref={searchInput}
                        data-test="filters-search"
                    />
                </form>
            </FilterItem>
        </Container>
    );
}

const Container = styled.div`
    background: rgba(0, 0, 0, 0.7);
    padding: 2rem;
    font-size: 3rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    gap: 2rem;
    position: fixed;
    z-index: 200;
    top: 4.5rem;
    left: 30rem;
    right: 30rem;
`;

const FilterItem = styled.div<{ large?: boolean }>`
    flex: ${(props) => (props.large ? 1.5 : 1)};
`;
