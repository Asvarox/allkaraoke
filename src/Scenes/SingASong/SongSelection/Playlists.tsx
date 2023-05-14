import styled from '@emotion/styled';
import { Button } from 'Elements/Button';
import { typography } from 'Elements/cssMixins';
import useKeyboard from 'hooks/useKeyboard';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { useEffect, useMemo } from 'react';
import { AppliedFilters } from 'Scenes/SingASong/SongSelection/Hooks/useSongList';
import { addDays } from 'date-fns';

interface PlaylistEntry {
    name: string;
    filters: AppliedFilters;
}

const usePlaylists = (): PlaylistEntry[] =>
    useMemo(
        () => [
            { name: 'All', filters: {} },
            { name: 'English', filters: { language: 'English' } },
            { name: 'Polish', filters: { language: 'Polish' } },
            { name: 'Classics', filters: { yearBefore: 1995 } },
            { name: 'Modern', filters: { yearAfter: 1995 } },
            { name: 'Duets', filters: { duet: true } },
            { name: 'New', filters: { updatedAfter: addDays(new Date(), -31).toISOString() } },
        ],
        [],
    );

interface Props {
    setFilters: (filters: AppliedFilters) => void;
    closePlaylist: (leavingKey: 'left' | 'right') => void;
    active: boolean;
}

export default function Playlists({ setFilters, active, closePlaylist }: Props) {
    const playlists = usePlaylists();

    const { register, focused, focusElement } = useKeyboardNav({
        enabled: active,
        additionalHelp: {
            // It's possible to leave the playlists with left/right
            vertical: undefined,
            'horizontal-vertical': null,
        },
    });

    useEffect(() => {
        if (focused) {
            const playlist = playlists.find((list) => list.name === focused);
            playlist && setFilters(playlist.filters);
        }
    }, [focused, playlists]);

    useKeyboard(
        {
            left: () => closePlaylist('left'),
            right: () => closePlaylist('right'),
        },
        active,
    );

    return (
        <Container data-test="song-list-playlists">
            {playlists.map((playlist) => (
                <Playlist
                    data-test={`playlist-${playlist.name}`}
                    key={playlist.name}
                    {...register(playlist.name, () => focusElement(playlist.name))}
                    {...(!active ? { focused: false, active: playlist.name === focused } : {})}>
                    {playlist.name}
                </Playlist>
            ))}
        </Container>
    );
}

const Container = styled.div`
    background: rgba(0, 0, 0, 0.7);
    width: 100vh;
    transform-origin: top right;
    transform: rotate(-90deg);
    position: absolute;
    left: -100vh;
    top: 0;
    font-size: 3.6rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: row-reverse;

    h2 {
        ${typography};
        margin: 0;
    }
`;

const Playlist = styled(Button)<{ active?: boolean }>`
    font-size: 3rem;
    flex: 1;
    padding: 1.5rem;
    ${(props) => props.active === false && `opacity: .5;`}
`;
