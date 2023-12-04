import useSongList from 'Scenes/SingASong/SongSelection/Hooks/useSongList';
import { useSongSelectionKeyboardNavigation } from 'Scenes/SingASong/SongSelection/Hooks/useSongSelectionKeyboardNavigation';
import { woosh } from 'SoundManager';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { randomInt } from 'utils/randomValue';
import startViewTransition from 'utils/startViewTransition';

export default function useSongSelection(preselectedSong: string | null, songsPerRow: number) {
  const {
    songList,
    groupedSongList,
    setFilters,
    filters,
    isLoading,
    selectedPlaylist,
    setSelectedPlaylist,
    playlists,
  } = useSongList();
  const navigate = useSmoothNavigate();
  const [keyboardControl, setKeyboardControl] = useState(true);

  const handleKeyboardControl = (value: boolean) => {
    startViewTransition(() => {
      flushSync(() => {
        setKeyboardControl(value);
      });
    });
    woosh.play();
  };

  const [focusedSong, focusedGroup, moveToSong, showFilters, setShowFilters, randomSong] =
    useSongSelectionKeyboardNavigation(
      keyboardControl,
      groupedSongList,
      () => handleKeyboardControl(false),
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
      navigate(`game/${encodeURIComponent(songList[focusedSong].id)}${window.location.search}`, {
        replace: true,
        smooth: false,
      });
    }
  }, [preselected, focusedSong, songList]);

  const songPreview = songList?.[focusedSong];
  return {
    groupedSongList,
    focusedSong,
    focusedGroup,
    moveToSong,
    setKeyboardControl: handleKeyboardControl,
    keyboardControl,
    songPreview,
    songList: songList ?? [],
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    isLoading,
    randomSong,
    selectedPlaylist,
    setSelectedPlaylist,
    playlists,
  };
}
