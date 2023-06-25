import { useEffect, useState } from 'react';
import useSongList from 'Scenes/SingASong/SongSelection/Hooks/useSongList';
import { useSongSelectionKeyboardNavigation } from 'Scenes/SingASong/SongSelection/Hooks/useSongSelectionKeyboardNavigation';
import { randomInt } from 'utils/randomValue';
import useSmoothNavigate from 'hooks/useSmoothNavigate';

export default function useSongSelection(preselectedSong: string | null, songsPerRow: number) {
    const { songList, prefilteredList, groupedSongList, filtersData, setFilters, filters, isLoading } = useSongList();
    const navigate = useSmoothNavigate();
    const [keyboardControl, setKeyboardControl] = useState(true);

    const [focusedSong, focusedGroup, moveToSong, showFilters, setShowFilters] = useSongSelectionKeyboardNavigation(
        keyboardControl,
        groupedSongList,
        () => setKeyboardControl(false),
        songList.length,
        filters,
        songsPerRow,
    );

    const [preselected, setPreselected] = useState(false);
    useEffect(() => {
        if (!preselected && songList.length) {
            const preselectedSongIndex = songList.findIndex((song) => song.file === preselectedSong);
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
            navigate(`/game/${encodeURIComponent(songList[focusedSong].file)}`, { replace: true, smooth: false });
        }
    }, [preselected, focusedSong, songList]);

    const songPreview = songList?.[focusedSong];
    return {
        prefilteredList,
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
