import styled from '@emotion/styled';
import { Search } from '@mui/icons-material';
import { Input } from 'Elements/Input';
import WebRTCClient from 'RemoteMic/Network/WebRTCClient';
import { MAX_NAME_LENGTH } from 'consts';
import useDebounce from 'hooks/useDebounce';
import { useEffect, useRef, useState } from 'react';
import { useUnmount } from 'react-use';

interface Props {
    // children: (props: { onClick: () => void }) => ReactNode;
    onSearchStateChange?: (isActive: boolean) => void;
}

function RemoteSongSearch({ onSearchStateChange }: Props) {
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement | null>(null);

    const debouncedSearch = useDebounce(search, 100);

    useEffect(() => {
        WebRTCClient.searchSong(debouncedSearch.trim());
    }, [debouncedSearch]);

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
