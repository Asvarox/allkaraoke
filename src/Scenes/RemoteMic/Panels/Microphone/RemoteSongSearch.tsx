import { Search } from '@mui/icons-material';
import { Input } from 'Elements/Input';
import WebRTCClient from 'RemoteMic/Network/WebRTCClient';
import { MAX_NAME_LENGTH } from 'consts';
import useDebounce from 'hooks/useDebounce';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useUnmount } from 'react-use';

interface Props {
    children: (props: { onClick: () => void }) => ReactNode;
    onSearchStateChange?: (isActive: boolean) => void;
}

function RemoteSongSearch({ children, onSearchStateChange }: Props) {
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [isOpen, setIsOpen] = useState(false);

    const onOpen = () => {
        setIsOpen(true);
        onSearchStateChange?.(true);
    };

    const onClose = () => {
        setIsOpen(false);
        onSearchStateChange?.(false);
    };

    const debouncedSearch = useDebounce(search, 100);

    useEffect(() => {
        WebRTCClient.searchSong(debouncedSearch.trim());
    }, [debouncedSearch]);

    useUnmount(() => onSearchStateChange?.(false));

    return (
        <>
            {children({ onClick: isOpen ? onClose : onOpen })}
            {isOpen && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onClose();
                    }}>
                    <Input
                        maxLength={MAX_NAME_LENGTH}
                        focused={false}
                        label={<Search />}
                        placeholder="Search for a song…"
                        value={search}
                        onChange={setSearch}
                        ref={inputRef}
                        autoFocus
                        data-test="search-song-input"
                    />
                </form>
            )}
        </>
    );
}
export default RemoteSongSearch;
