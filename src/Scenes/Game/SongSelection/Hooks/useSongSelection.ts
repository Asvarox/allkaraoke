import { useEffect, useState } from 'react';
import useSongList from './useSongList';
import { useSongSelectionKeyboardNavigation } from './useSongSelectionKeyboardNavigation';
import { randomInt } from 'utils/randomValue';
import usePrevious from 'hooks/usePrevious';

export default function useSongSelection(preselectedSong: string | null) {
    const { songList, groupedSongList, filtersData, setFilters, filters, isLoading } = useSongList();

    const [keyboardControl, setKeyboardControl] = useState(true);

    const [focusedSong, focusedGroup, moveToSong, showFilters, setShowFilters] = useSongSelectionKeyboardNavigation(
        keyboardControl,
        groupedSongList,
        () => setKeyboardControl(false),
        songList.length,
        filters,
    );

    useEffect(() => {
        if (songList && songList[focusedSong])
            window.history.replaceState({}, '', `#/game/${encodeURIComponent(songList[focusedSong].file)}`);
    }, [focusedSong, songList]);

    const previousIsLoading = usePrevious(isLoading);
    useEffect(() => {
        if (previousIsLoading && !isLoading) {
            const preselectedSongIndex = songList.findIndex((song) => song.file === preselectedSong);
            const firstNewSongIndex = songList.findIndex((song) => song.isNew);

            let songIndex = randomInt(0, songList.length);
            if (preselectedSongIndex > -1) songIndex = preselectedSongIndex;
            else if (firstNewSongIndex > -1) songIndex = preselectedSongIndex;

            moveToSong(songIndex);
        }
    }, [previousIsLoading, isLoading, songList, moveToSong, preselectedSong]);

    const songPreview = songList?.[focusedSong];
    return {
        groupedSongList,
        focusedSong,
        focusedGroup,
        moveToSong,
        setKeyboardControl,
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
