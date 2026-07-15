import { Search } from '@mui/icons-material';
import { ComponentRef, useEffect, useRef, useState } from 'react';
import { twc } from 'react-twc';
import { usePrevious, useUnmount } from 'react-use';

import { MAX_NAME_LENGTH } from '~/consts';
import { Input } from '~/modules/elements/input';
import useDebounce from '~/modules/hooks/use-debounce';
import { serverRpc } from '~/modules/remote-mic/network/client';

interface Props {
  // children: (props: { onClick: () => void }) => ReactNode;
  onSearchStateChange?: (isActive: boolean) => void;
}

function RemoteSongSearch({ onSearchStateChange }: Props) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<ComponentRef<typeof Input>>(null);

  const debouncedSearch = useDebounce(search, 100);

  const previousSearch = usePrevious(debouncedSearch);
  useEffect(() => {
    if (previousSearch !== debouncedSearch) {
      void serverRpc.songs.search(debouncedSearch.trim());
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

const SearchInput = twc(Input)`mb-2 w-full`;
export default RemoteSongSearch;
