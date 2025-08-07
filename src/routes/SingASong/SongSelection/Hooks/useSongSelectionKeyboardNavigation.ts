import { chunk, throttle } from 'es-toolkit';
import { menuBack, menuEnter, menuNavigate } from 'modules/SoundManager';
import useKeyboard from 'modules/hooks/useKeyboard';
import useKeyboardHelp from 'modules/hooks/useKeyboardHelp';
import usePrevious from 'modules/hooks/usePrevious';
import useSmoothNavigate from 'modules/hooks/useSmoothNavigate';
import tuple from 'modules/utils/tuple';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { HelpEntry } from 'routes/KeyboardHelp/Context';
import selectRandomSong from 'routes/SingASong/SongSelection/Hooks/selectRandomSong';
import { SongGroup } from 'routes/SingASong/SongSelection/Hooks/useSongList';
import { AppliedFilters } from 'routes/SingASong/SongSelection/Hooks/useSongListFilter';
import { getSongIdWithNew } from 'routes/SingASong/SongSelection/utils/getSongIdWithNew';

const previouslySelectedSongs: number[] = [];

const useTwoDimensionalNavigation = (groups: SongGroup[] = [], itemsPerRow: number) => {
  const [cursorPosition, setCursorPosition] = useState<[number, number]>([0, 0]);

  const songIdMatrix = useMemo(
    () =>
      groups
        .map((group) =>
          chunk(
            group.songs.map((song) => getSongIdWithNew(song, group)),
            itemsPerRow,
          ),
        )
        .flat(),
    [groups, itemsPerRow],
  );

  const isAtLastColumn = cursorPosition[0] === songIdMatrix[cursorPosition[1]]?.length - 1;

  const selectedSongId = useMemo(() => {
    const [x, y] = cursorPosition;
    const yRow = songIdMatrix[y];
    if (!yRow) return '';
    const xPos = Math.min(x, yRow.length - 1);

    return yRow[xPos];
  }, [cursorPosition, songIdMatrix]);

  const moveToSong = useCallback(
    (songId: string) => {
      const y = songIdMatrix.findIndex((row) => row.includes(songId));
      const x = songIdMatrix[y]?.indexOf(songId) ?? -1;
      if (x === -1 || y === -1) {
        setCursorPosition([0, 0]);
      } else {
        setCursorPosition([x, y]);
      }
    },
    [songIdMatrix],
  );

  const [previousSelectedSongId, setPreviousSelectedSongId] = useState(() => selectedSongId);
  if (previousSelectedSongId !== selectedSongId) setPreviousSelectedSongId(selectedSongId);
  const [previousSongIdMatrix, setPreviousSongIdMatrix] = useState(() => songIdMatrix);
  if (previousSongIdMatrix !== songIdMatrix) setPreviousSongIdMatrix(songIdMatrix);

  if (previousSongIdMatrix !== songIdMatrix && previousSelectedSongId && previousSelectedSongId !== selectedSongId) {
    setPreviousSongIdMatrix(songIdMatrix);
    moveToSong(previousSelectedSongId);
  }

  const moveCursor = (plane: 'x' | 'y', delta: number) => {
    menuNavigate.play();
    setCursorPosition(([x, y]) => {
      // in case list is empty
      if (songIdMatrix.length === 0) return [0, 0];
      let newX = x;
      let newY = y;
      if (plane === 'y') {
        newY = y + delta;
      } else {
        if (songIdMatrix[y] === undefined) {
          debugger;
        }
        const maxXInRow = (songIdMatrix[y]?.length ?? 1) - 1;
        newX = Math.min(x, maxXInRow) + delta;
        if (newX < 0) {
          newY = (songIdMatrix.length + y - 1) % songIdMatrix.length;
          newX = songIdMatrix[newY].length - 1;
        } else if (newX > maxXInRow) {
          newY = y + 1;
          newX = 0;
        }
      }
      return [newX % itemsPerRow, (songIdMatrix.length + newY) % songIdMatrix.length];
    });
  };

  return tuple([selectedSongId, cursorPosition, moveCursor, moveToSong, isAtLastColumn]);
};

export const useSongSelectionKeyboardNavigation = (
  enabled: boolean,
  groupedSongs: SongGroup[] = [],
  onEnter: () => void,
  songCount: number,
  appliedFilters: AppliedFilters,
  songsPerRow: number,
) => {
  const navigate = useSmoothNavigate();
  // We need to record how user entered (from which "side") and how left and based on that update the selection.
  // Eg if user was at the last column, entered playlists, and returned to the last column (by clicking left)
  // then effectively the selection shouldn't change
  const [showPlaylistsState, setShowPlaylistsState] = useState<[boolean, 'left' | 'right' | null]>([false, null]);
  const previousPlaylistsState = usePrevious(showPlaylistsState);
  const [arePlaylistsVisible, leavingKey] = showPlaylistsState;

  const [selectedSongId, cursorPosition, moveCursor, moveToSong, isAtLastColumn] = useTwoDimensionalNavigation(
    groupedSongs,
    songsPerRow,
  );
  const isAtFirstColumn = cursorPosition[0] === 0;

  const handleEnter = () => {
    menuEnter.play();
    onEnter();
  };

  const [blockBack, setBlockBack] = useState(false);
  const previousSearch = usePrevious(appliedFilters.search);
  useLayoutEffect(() => {
    if (previousSearch && !appliedFilters.search) {
      setBlockBack(true);
      const timeout = setTimeout(() => setBlockBack(false), 2_000);

      return () => {
        clearTimeout(timeout);
        setBlockBack(false);
      };
    }
  }, [appliedFilters.search]);

  const handleBackspace = () => {
    if (!blockBack && !appliedFilters.search) {
      menuBack.play();
      navigate('menu/');
    }
  };

  const navigateToGroup = useMemo(
    () =>
      throttle(
        (direction: 1 | -1, currentGroup: number) => {
          const nextGroupIndex = (groupedSongs.length + currentGroup + direction) % groupedSongs.length;

          moveToSong(groupedSongs[nextGroupIndex].songs[0].song.id);
          menuNavigate.play();
        },
        700,
        { edges: ['leading'] },
      ),
    [groupedSongs, moveToSong],
  );

  const navigateVertically = (e: KeyboardEvent | undefined, direction: 1 | -1) => {
    if (!e?.repeat) {
      moveCursor('y', direction);
    } else {
      const currentlySelectedGroupIndex = groupedSongs.findIndex(
        (group) => !!group.songs.find((song) => song.song.id === selectedSongId),
      );
      navigateToGroup(direction, currentlySelectedGroupIndex);
    }
  };

  const navigateHorizontally = (direction: 1 | -1, ignoreFilters = false) => {
    // Disable navigation to filters by going right since the filters are on the left
    // if (!ignoreFilters && direction === 1 && isAtLastColumn && !arePlaylistsVisible) {
    //   setShowPlaylistsState([true, 'right']);
    // } else
    if (!ignoreFilters && direction === -1 && isAtFirstColumn && !arePlaylistsVisible) {
      setShowPlaylistsState([true, 'left']);
    } else {
      moveCursor('x', direction);
    }
  };

  const randomSong = () => {
    const newIndex = selectRandomSong(songCount, previouslySelectedSongs);
    for (const group of groupedSongs) {
      for (const song of group.songs) {
        if (song.index === newIndex) {
          moveToSong(song.song.id);
          return;
        }
      }
    }
  };

  useKeyboard(
    {
      accept: handleEnter,
      down: (e) => navigateVertically(e, 1),
      up: (e) => navigateVertically(e, -1),
      left: () => navigateHorizontally(-1),
      right: () => navigateHorizontally(1),
      back: handleBackspace,
      random: randomSong,
    },
    enabled && !arePlaylistsVisible,
    [groupedSongs, cursorPosition, arePlaylistsVisible, appliedFilters, blockBack],
  );

  const help = useMemo<HelpEntry>(
    () => ({
      'horizontal-vertical': null,
      accept: null,
      back: null,
      shiftR: null,
      alphanumeric: null,
      remote: ['search', 'select-song'],
    }),
    [],
  );
  useKeyboardHelp(help, enabled);

  const closePlaylist = useCallback(
    (newLeavingKey?: 'left' | 'right') => {
      setShowPlaylistsState([false, newLeavingKey ?? null]);
      // if (leavingKey === 'right') navigateHorizontally(1);
    },
    [setShowPlaylistsState, navigateHorizontally, groupedSongs, cursorPosition],
  );

  useLayoutEffect(() => {
    const [previousShowFilters, enteringKey] = previousPlaylistsState;
    if (previousShowFilters && !arePlaylistsVisible) {
      if (enteringKey === leavingKey) navigateHorizontally(leavingKey === 'right' ? 1 : -1, true);
    }
  }, [arePlaylistsVisible, leavingKey, isAtFirstColumn, isAtLastColumn, ...cursorPosition]);

  return [selectedSongId, moveToSong, arePlaylistsVisible, closePlaylist, randomSong] as const;
};
