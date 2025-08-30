import { woosh } from 'modules/SoundManager';
import { randomInt } from 'modules/utils/randomValue';
import startViewTransition from 'modules/utils/startViewTransition';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import useSongList from 'routes/SingASong/SongSelection/Hooks/useSongList';
import { useSongSelectionKeyboardNavigation } from 'routes/SingASong/SongSelection/Hooks/useSongSelectionKeyboardNavigation';

export default function useSongSelection(additionalSong: string | null, songsPerRow: number) {
  const cleanAdditionalSong = additionalSong?.replace('-new-group', '') ?? null;
  const {
    songList,
    groupedSongList,
    setFilters,
    filters,
    isLoading,
    selectedPlaylist,
    setSelectedPlaylist,
    playlists,
  } = useSongList(cleanAdditionalSong);
  const [keyboardControl, setKeyboardControl] = useState(true);

  const handleKeyboardControl = (value: boolean, additionalUpdates?: () => void) => {
    startViewTransition(() => {
      flushSync(() => {
        setKeyboardControl(value);
        additionalUpdates?.();
      });
    });
    woosh.play(false);
  };

  const [selectedSongId, moveToSong, showFilters, setShowFilters, randomSong] = useSongSelectionKeyboardNavigation(
    keyboardControl,
    groupedSongList,
    () => handleKeyboardControl(false),
    songList.length,
    filters,
    songsPerRow,
  );
  const cleanSelectedSongId = selectedSongId.replace('-new-group', '');

  const [preselected, setPreselected] = useState(false);
  if (!preselected && songList.length && !isLoading) {
    let songId = '';
    const newSong = songList.find((song) => song.isNew);
    if (additionalSong && songList.some((song) => song.id === cleanAdditionalSong)) songId = additionalSong;
    else if (newSong) songId = newSong.id;
    else songId = songList[randomInt(0, songList.length - 1)].id;

    moveToSong(songId);
    setPreselected(true);
  }

  useEffect(() => {
    if (additionalSong !== null) {
      setPreselected(false);
    }
  }, [additionalSong]);

  useEffect(() => {
    if (preselected && !isLoading && songList.length && songList.some((song) => song.id === cleanSelectedSongId)) {
      /// push query param to url containing playlist name
      const url = new URL(globalThis.location?.href);
      url.searchParams.set('song', selectedSongId!);
      globalThis.history.replaceState(null, '', url.toString());
    }
  }, [preselected, selectedSongId, songList, isLoading]);

  const songPreview = songList?.find((song) => song.id === cleanSelectedSongId);
  return {
    groupedSongList,
    focusedSong: selectedSongId,
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
