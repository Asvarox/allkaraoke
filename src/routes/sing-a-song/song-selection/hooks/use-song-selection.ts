import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import { woosh } from '~/modules/sound-manager';
import { randomInt } from '~/modules/utils/random-value';
import startViewTransition from '~/modules/utils/start-view-transition';
import useSongList from '~/routes/sing-a-song/song-selection/hooks/use-song-list';
import { useSongSelectionKeyboardNavigation } from '~/routes/sing-a-song/song-selection/hooks/use-song-selection-keyboard-navigation';
import useToolbarKeyboardNav from '~/routes/sing-a-song/song-selection/hooks/use-toolbar-keyboard-nav';

export default function useSongSelection(additionalSong: string | null, songsPerRow: number) {
  const cleanAdditionalSong = additionalSong?.replace('-new-group', '') ?? null;
  const {
    songList,
    groupedSongList,
    unverifiedSongsLoading,
    setFilters,
    filters,
    isLoading,
    selectedPlaylist,
    setSelectedPlaylist,
    playlists,
  } = useSongList(cleanAdditionalSong);
  const [keyboardControl, setKeyboardControl] = useState(true);
  const [toolbarFocusMode, setToolbarFocusMode] = useState(false);
  const navigate = useSmoothNavigate();

  const handleKeyboardControl = (value: boolean, additionalUpdates?: () => void) => {
    startViewTransition(() => {
      flushSync(() => {
        setKeyboardControl(value);
        additionalUpdates?.();
      });
    });
    woosh.play(false);
  };

  const { row1Register, row2Register, focusRow1Element, focusRow2Element, setActiveRow } = useToolbarKeyboardNav({
    enabled: toolbarFocusMode,
    onExitDown: () => {
      // keyboardControl was never changed when entering toolbar mode,
      // so we only need to clear the toolbar flag to re-enable song list nav.
      setToolbarFocusMode(false);
    },
    onExitBackspace: () => navigate('menu/'),
  });

  const onEnterToolbar = () => {
    // Do NOT call handleKeyboardControl(false) here — that would expand the song preview.
    // Disabling song list keyboard nav is done by passing keyboardControl && !toolbarFocusMode
    // to useSongSelectionKeyboardNavigation below.
    setToolbarFocusMode(true);
    setActiveRow(1);
    focusRow1Element('search');
  };

  const onEnterSongGroupsNav = (groupName: string) => {
    setToolbarFocusMode(true);
    setActiveRow(2);
    focusRow2Element(groupName);
  };

  const [selectedSongId, moveToSong, showFilters, setShowFilters, randomSong] = useSongSelectionKeyboardNavigation(
    // Disable song list nav while toolbar is focused, without affecting keyboardControl
    keyboardControl && !toolbarFocusMode,
    groupedSongList,
    () => handleKeyboardControl(false),
    songList.length,
    filters,
    songsPerRow,
    onEnterToolbar,
    onEnterSongGroupsNav,
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
      const url = new URL(global.location?.href);
      url.searchParams.set('song', selectedSongId!);
      global.history.replaceState(null, '', url.toString());
    }
  }, [preselected, selectedSongId, songList, isLoading]);

  const songPreview = songList?.find((song) => song.id === cleanSelectedSongId);
  return {
    groupedSongList,
    focusedSong: selectedSongId,
    moveToSong,
    setKeyboardControl: handleKeyboardControl,
    keyboardControl,
    toolbarFocusMode,
    row1Register,
    row2Register,
    onPlaylistSelectedInToolbar: () => {
      // Same as onExitDown: keyboardControl was never changed, just clear the toolbar flag.
      setToolbarFocusMode(false);
    },
    songPreview,
    songList: songList ?? [],
    unverifiedSongsLoading,
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
