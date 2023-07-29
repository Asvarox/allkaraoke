import { Search } from '@mui/icons-material';
import { Input } from 'Elements/Input';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import Modal from 'Elements/Modal';
import WebRTCClient from 'RemoteMic/Network/WebRTCClient';
import { MAX_NAME_LENGTH } from 'consts';
import useDebounce from 'hooks/useDebounce';
import { ReactNode, useEffect, useRef, useState } from 'react';

interface Props {
    children: (props: { onClick: () => void }) => ReactNode;
}

function RemoteSongSearch({ children }: Props) {
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [isOpen, setIsOpen] = useState(false);

    const debouncedSearch = useDebounce(search, 100);

    useEffect(() => {
        WebRTCClient.searchSong(debouncedSearch.trim());
    }, [debouncedSearch]);

    return (
        <>
            {children({ onClick: () => setIsOpen(true) })}
            {isOpen && (
                <Modal onClose={() => setIsOpen(false)}>
                    <MenuContainer>
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
                        <MenuButton onClick={() => setIsOpen(false)} data-test="close-search">
                            Close
                        </MenuButton>
                    </MenuContainer>
                </Modal>
            )}
        </>
    );
}
export default RemoteSongSearch;
