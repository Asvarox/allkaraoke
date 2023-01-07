import { useEffect, useState } from 'react';
import useSongList from './useSongList';
import { useSongSelectionKeyboardNavigation } from './useSongSelectionKeyboardNavigation';

export default function useSongSelection(preselectedSong: string | null) {
    const { songList, groupedSongList, filtersData, setFilters, filters, isLoading } = useSongList();

    const [keyboardControl, setKeyboardControl] = useState(true);

    const [focusedSong, setFocusedSong, showFilters, setShowFilters] = useSongSelectionKeyboardNavigation(
        keyboardControl,
        groupedSongList,
        () => setKeyboardControl(false),
        songList.length,
        filters,
    );

    useEffect(() => {
        console.log('useSongSelection', 'mount');

        return () => {
            console.log('useSongSelection', 'unmount');
        };
    }, []);

    useEffect(() => {
        if (songList && songList[focusedSong])
            window.history.replaceState({}, '', `#/game/${encodeURIComponent(songList[focusedSong].file)}`);
    }, [focusedSong, songList]);

    useEffect(() => {
        if (songList && preselectedSong) {
            const newIndex = songList.findIndex((song) => song.file === preselectedSong);

            if (newIndex > -1) setTimeout(() => setFocusedSong(newIndex));
        }
    }, [songList, preselectedSong]);

    const songPreview = songList?.[focusedSong];
    return {
        groupedSongList,
        focusedSong,
        setFocusedSong,
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
