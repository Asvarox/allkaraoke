import useSongList from 'Scenes/SingASong/SongSelection/Hooks/useSongList';
import { useSongSelectionKeyboardNavigation } from 'Scenes/SingASong/SongSelection/Hooks/useSongSelectionKeyboardNavigation';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { randomInt } from 'utils/randomValue';
import startViewTransition from 'utils/startViewTransition';

export default function useSongSelection(preselectedSong: string | null, songsPerRow: number) {
    const { songList, prefilteredList, groupedSongList, filtersData, setFilters, filters, isLoading } = useSongList();
    const navigate = useSmoothNavigate();
    const [keyboardControl, setKeyboardControl] = useState(true);

    const handleKeyboarcControl = (value: boolean) => {
        startViewTransition(() => {
            flushSync(() => {
                setKeyboardControl(value);
            });
        });
    };

    const [focusedSong, focusedGroup, moveToSong, showFilters, setShowFilters] = useSongSelectionKeyboardNavigation(
        keyboardControl,
        groupedSongList,
        () => handleKeyboarcControl(false),
        songList.length,
        filters,
        songsPerRow,
    );

    const [preselected, setPreselected] = useState(false);
    useEffect(() => {
        if (!preselected && songList.length) {
            const preselectedSongIndex = songList.findIndex((song) => song.id === preselectedSong);
            const firstNewSongIndex = songList.findIndex((song) => song.isNew);

            let songIndex = randomInt(0, songList.length - 1);
            if (preselectedSongIndex > -1) songIndex = preselectedSongIndex;
            else if (firstNewSongIndex > -1) songIndex = preselectedSongIndex;

            moveToSong(songIndex);
            setPreselected(true);
        }
    }, [songList, moveToSong, preselectedSong]);

    useEffect(() => {
        if (preselected && songList.length && songList[focusedSong]) {
            navigate(`/game/${encodeURIComponent(songList[focusedSong].id)}`, { replace: true, smooth: false });
        }
    }, [preselected, focusedSong, songList]);

    const songPreview = songList?.[focusedSong];
    return {
        prefilteredList,
        groupedSongList,
        focusedSong,
        focusedGroup,
        moveToSong,
        setKeyboardControl: handleKeyboarcControl,
        keyboardControl,
        songPreview,
        songList: songList ?? [],
        filtersData,
        filters,
        setFilters,
        showFilters,
        setShowFilters,
        isLoading,
    };
}
