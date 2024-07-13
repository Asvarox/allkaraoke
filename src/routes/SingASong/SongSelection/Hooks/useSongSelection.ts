import { woosh } from 'modules/SoundManager';
import { randomInt } from 'modules/utils/randomValue';
import startViewTransition from 'modules/utils/startViewTransition';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import useSongList from 'routes/SingASong/SongSelection/Hooks/useSongList';
import { useSongSelectionKeyboardNavigation } from 'routes/SingASong/SongSelection/Hooks/useSongSelectionKeyboardNavigation';

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
  const [keyboardControl, setKeyboardControl] = useState(true);

  const handleKeyboardControl = (value: boolean) => {
    startViewTransition(() => {
      flushSync(() => {
        setKeyboardControl(value);
      });
    });
    woosh.play(false);
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
    if (!preselected && songList.length && !isLoading) {
      const preselectedSongIndex = songList.findIndex((song) => song.id === preselectedSong);
      const firstNewSongIndex = songList.findIndex((song) => song.isNew);

      let songIndex = randomInt(0, songList.length - 1);
      if (preselectedSongIndex > -1) songIndex = preselectedSongIndex;
      else if (firstNewSongIndex > -1) songIndex = preselectedSongIndex;

      setPreselected(true);
      moveToSong(songIndex);
    }
  }, [moveToSong, preselected, focusedSong, songList, preselectedSong, isLoading]);

  useEffect(() => {
    if (preselected && songList.length && songList[focusedSong] && !isLoading) {
      /// push query param to url containing playlist name
      const url = new URL(global.location?.href);
      url.searchParams.set('song', songList[focusedSong].id);
      global.history.replaceState(null, '', url.toString());
    }
  }, [preselected, focusedSong, songList, isLoading]);

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
    isLoading: isLoading || !preselected,
    randomSong,
    selectedPlaylist,
    setSelectedPlaylist,
    playlists,
  };
}
