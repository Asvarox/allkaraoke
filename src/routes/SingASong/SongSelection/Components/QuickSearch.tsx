import styled from '@emotion/styled';
import { ComponentRef, Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Input } from '~/modules/Elements/Input';
import events from '~/modules/GameEvents/GameEvents';
import { useEventEffect } from '~/modules/GameEvents/hooks';
import { REGULAR_ALPHA_CHARS } from '~/modules/hooks/useKeyboard';

import { AppliedFilters } from '~/routes/SingASong/SongSelection/Hooks/useSongListFilter';

interface Props {
  setFilters: Dispatch<SetStateAction<AppliedFilters>>;
  setVisible: Dispatch<SetStateAction<boolean>>;
  filters: AppliedFilters;
  keyboardControl: boolean;
  visible: boolean;
}
export default function QuickSearch({ setFilters, filters, keyboardControl, visible, setVisible }: Props) {
  const searchInput = useRef<ComponentRef<typeof Input>>(null);
  const [isFocused, setIsFocused] = useState(false);

  const setSearch = (value: string) => {
    setFilters((current) => ({
      ...current,
      search: value,
    }));
  };

  const onLeave = () => {
    searchInput.current?.element?.blur();
  };

  useHotkeys('down', onLeave, { enabled: isFocused, enableOnTags: ['INPUT'] });

  const onSearchSong = (e: KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setSearch(e.key);
  };

  useHotkeys(
    REGULAR_ALPHA_CHARS,
    (e) => {
      onSearchSong(e);
      setVisible(true);
    },
    {
      enabled: !filters.search && keyboardControl,
    },
  );

  const onRemoteSearch = useCallback(
    (search: string) => {
      if (keyboardControl) {
        setSearch(search);
      }
    },
    [keyboardControl],
  );
  useEventEffect(events.remoteSongSearch, onRemoteSearch);

  useHotkeys(
    REGULAR_ALPHA_CHARS,
    (e) => {
      onSearchSong(e);
      searchInput.current?.element?.focus();
    },
    { enabled: !isFocused && keyboardControl },
    [filters.search],
  );

  useHotkeys(
    'Backspace',
    () => {
      searchInput.current?.element?.focus();
    },
    { enabled: !isFocused && keyboardControl },
    [filters.search],
  );

  useEffect(() => {
    // Navigating to another playlist will blur the search input and clear the search - this hides the input
    if (!isFocused) {
      setVisible(!!filters.search);
    }
  }, [isFocused, filters.search, setVisible]);

  if (!filters.search && !visible) {
    return null;
  }

  return (
    <Container data-test="song-list-search">
      <FilterItem large>
        <form
          data-test="filters-search-form"
          onSubmit={(e) => {
            e.preventDefault();
            searchInput.current?.element?.blur();
          }}>
          <Input
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              // Hide the search input when the user presses backspace and the search is empty
              if (e.key === 'Backspace' && filters.search?.length === 0) {
                setVisible(false);
              }
            }}
            focused={isFocused}
            autoFocus
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
