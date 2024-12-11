import { chunk, throttle } from 'lodash-es';
import { menuBack, menuEnter, menuNavigate } from 'modules/SoundManager';
import useKeyboard from 'modules/hooks/useKeyboard';
import useKeyboardHelp from 'modules/hooks/useKeyboardHelp';
import usePrevious from 'modules/hooks/usePrevious';
import useSmoothNavigate from 'modules/hooks/useSmoothNavigate';
import tuple from 'modules/utils/tuple';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { HelpEntry } from 'routes/KeyboardHelp/Context';
import selectRandomSong from 'routes/SingASong/SongSelection/Hooks/selectRandomSong';
import { SongGroup } from 'routes/SingASong/SongSelection/Hooks/useSongList';
import { AppliedFilters } from 'routes/SingASong/SongSelection/Hooks/useSongListFilter';

const previouslySelectedSongs: number[] = [];

const useTwoDimensionalNavigation = (groups: SongGroup[] = [], itemsPerRow: number) => {
  const [cursorPosition, setCursorPosition] = useState<[number, number]>([0, 0]);

  // creates a "hash" of the groups to detect changes
  const groupShape = useMemo(() => groups.map(({ songs }) => songs.length).join(','), [groups]);
  const songIndexMatrix = useMemo(
    () =>
      groups
        .map(({ songs }) =>
          chunk(
            songs.map((song) => song.index),
            itemsPerRow,
          ),
        )
        .flat(),
    [groupShape, itemsPerRow],
  );
  const songGroupMatrix = useMemo(
    () =>
      groups
        .map(({ songs, name }) =>
          chunk(
            songs.map(() => name),
            itemsPerRow,
          ),
        )
        .flat(),
    [groupShape, itemsPerRow],
  );

  const previousMatrix = usePrevious(songIndexMatrix ?? []);

  const isAtLastColumn = cursorPosition[0] === songIndexMatrix[cursorPosition[1]]?.length - 1;

  const moveToSong = useCallback(
    (songIndex: number, groupLetter?: string) => {
      const y = songIndexMatrix.findIndex(
        (columns, index) => columns.includes(songIndex) && (!groupLetter || groupLetter === songGroupMatrix[index][0]),
      );
      const x = songIndexMatrix[y]?.indexOf(songIndex);
      if (x >= 0 && y >= 0) {
        setCursorPosition([x ?? 0, y ?? 0]);
      } else {
        setCursorPosition([0, 0]);
      }
    },
    [songIndexMatrix, songGroupMatrix],
  );

  const positionToValue = <T>([x, y]: [number, number], matrix: T[][], def: T) => {
    if (groups.length === 0) return def;
    const row = matrix[y];
    return row?.[x] ?? row?.at(-1) ?? matrix?.[0]?.[0] ?? def;
  };
  const positionToSongIndex = ([x, y]: [number, number], matrix: number[][] = songIndexMatrix) => {
    return positionToValue([x, y], matrix, 0);
  };
  const positionToGroup = ([x, y]: [number, number], matrix: string[][] = songGroupMatrix) => {
    return positionToValue([x, y], matrix, 'A');
  };

  useEffect(() => {
    const previousFocusedSong = positionToSongIndex(cursorPosition, previousMatrix);
    const currentFocusedSong = positionToSongIndex(cursorPosition, songIndexMatrix);
    if (previousMatrix.length && previousFocusedSong !== currentFocusedSong) {
      moveToSong(previousFocusedSong);
    }
  }, [cursorPosition, songIndexMatrix, previousMatrix, isAtLastColumn]);

  const moveCursor = (plane: 'x' | 'y', delta: number) => {
    menuNavigate.play();
    setCursorPosition(([x, y]) => {
      let newX = x;
      let newY = y;
      if (plane === 'y') {
        newY = y + delta;
      } else {
        if (songIndexMatrix[y] === undefined) {
          debugger;
        }
        const maxXInRow = songIndexMatrix[y].length - 1;
        newX = Math.min(x, maxXInRow) + delta;
        if (newX < 0) {
          newY = (songIndexMatrix.length + y - 1) % songIndexMatrix.length;
          newX = songIndexMatrix[newY].length - 1;
        } else if (newX > maxXInRow) {
          newY = y + 1;
          newX = 0;
        }
      }
      return [newX % itemsPerRow, (songIndexMatrix.length + newY) % songIndexMatrix.length];
    });
  };

  const focusedSong = positionToSongIndex(cursorPosition);
  const focusedGroup = positionToGroup(cursorPosition);

  return tuple([focusedSong, focusedGroup, cursorPosition, moveCursor, moveToSong, isAtLastColumn]);
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

  const [focusedSong, focusedGroup, cursorPosition, moveCursor, moveToSong, isAtLastColumn] =
    useTwoDimensionalNavigation(groupedSongs, songsPerRow);
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

          moveToSong(groupedSongs[nextGroupIndex].songs[0].index);
          menuNavigate.play();
        },
        700,
        { trailing: false },
      ),
    [groupedSongs, moveToSong],
  );

  const navigateVertically = (e: KeyboardEvent | undefined, direction: 1 | -1) => {
    if (!e?.repeat) {
      moveCursor('y', direction);
    } else {
      const currentlySelectedGroupIndex = groupedSongs.findIndex(
        (group) => !!group.songs.find((song) => song.index === focusedSong),
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
    moveToSong(newIndex);
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

  return [focusedSong, focusedGroup, moveToSong, arePlaylistsVisible, closePlaylist, randomSong] as const;
};
