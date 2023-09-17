import styled from '@emotion/styled';
import { Search } from '@mui/icons-material';
import { Input } from 'Elements/Input';
import RemoteMicClient from 'RemoteMic/Network/Client';
import { MAX_NAME_LENGTH } from 'consts';
import useDebounce from 'hooks/useDebounce';
import { useEffect, useRef, useState } from 'react';
import { usePrevious, useUnmount } from 'react-use';

interface Props {
  // children: (props: { onClick: () => void }) => ReactNode;
  onSearchStateChange?: (isActive: boolean) => void;
}

function RemoteSongSearch({ onSearchStateChange }: Props) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const debouncedSearch = useDebounce(search, 100);

  const previousSearch = usePrevious(debouncedSearch);
  useEffect(() => {
    if (previousSearch !== debouncedSearch) {
      RemoteMicClient.searchSong(debouncedSearch.trim());
    }
  }, [previousSearch, debouncedSearch]);

  useUnmount(() => onSearchStateChange?.(false));

  return (
    <SearchInput
      onFocus={() => onSearchStateChange?.(true)}
      onBlur={() => onSearchStateChange?.(false)}
      maxLength={MAX_NAME_LENGTH}
      focused={false}
      label={<Search />}
      placeholder="Search for a song…"
      value={search}
      onChange={setSearch}
      ref={inputRef}
      data-test="search-song-input"
    />
  );
}

const SearchInput = styled(Input)`
  width: 100%;
  margin-bottom: 1rem;
`;
export default RemoteSongSearch;
