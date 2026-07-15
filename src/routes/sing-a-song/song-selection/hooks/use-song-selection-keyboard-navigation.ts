import { chunk, throttle } from 'es-toolkit';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import useKeyboard from '~/modules/hooks/use-keyboard';
import useKeyboardHelp from '~/modules/hooks/use-keyboard-help';
import usePrevious from '~/modules/hooks/use-previous';
import { menuBack, menuEnter, menuNavigate } from '~/modules/sound-manager';
import tuple from '~/modules/utils/tuple';
import { HelpEntry } from '~/routes/keyboard-help/context';
import selectRandomSong from '~/routes/sing-a-song/song-selection/hooks/select-random-song';
import { SongGroup } from '~/routes/sing-a-song/song-selection/hooks/use-song-list';
import { AppliedFilters } from '~/routes/sing-a-song/song-selection/hooks/use-song-list-filter';
import { getSongIdWithNew } from '~/routes/sing-a-song/song-selection/utils/get-song-id-with-new';

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
          // This should never happen — cursorPosition.y is always within songIdMatrix bounds
          return [0, 0];
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
  onEnterToolbar: () => void,
  onEnterSongGroupsNav: (groupName: string) => void,
) => {
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

  // Ref that always reflects the current enabled state so stale hotkey closures
  // (react-hotkeys-hook v3 unbinds via useEffect, which fires after paint) can
  // still bail out immediately rather than running stale navigation logic.
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const handleEnter = () => {
    if (!enabledRef.current) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the search transition only; adding `previousSearch` would re-run the effect a render later and clear the block prematurely
  }, [appliedFilters.search]);

  const handleBackspace = () => {
    if (!enabledRef.current) return;
    if (!blockBack && !appliedFilters.search) {
      menuBack.play();
      onEnterToolbar();
    }
  };

  const navigateToGroup = useMemo(
    () =>
      throttle(
        (direction: 1 | -1, currentGroup: number) => {
          const nextGroupIndex = (groupedSongs.length + currentGroup + direction) % groupedSongs.length;
          const nextGroup = groupedSongs[nextGroupIndex];

          moveToSong(getSongIdWithNew(nextGroup.songs[0], nextGroup));
          menuNavigate.play();
        },
        700,
        { edges: ['leading'] },
      ),
    [groupedSongs, moveToSong],
  );

  const navigateVertically = (e: KeyboardEvent | undefined, direction: 1 | -1) => {
    if (!enabledRef.current) return;
    if (direction === -1 && !e?.repeat && cursorPosition[1] === 0) {
      // First row, single press up → enter Song Groups nav in toolbar
      const currentGroup = groupedSongs.find((group) =>
        group.songs.some((song) => getSongIdWithNew(song, group) === selectedSongId),
      );
      onEnterSongGroupsNav(currentGroup?.name ?? groupedSongs[0]?.name ?? '');
      return;
    }
    if (!e?.repeat) {
      moveCursor('y', direction);
    } else {
      const currentlySelectedGroupIndex = groupedSongs.findIndex((group) =>
        group.songs.some((song) => getSongIdWithNew(song, group) === selectedSongId),
      );
      navigateToGroup(direction, currentlySelectedGroupIndex);
    }
  };

  const navigateHorizontally = (direction: 1 | -1) => {
    if (!enabledRef.current) return;
    moveCursor('x', direction);
  };

  const randomSong = () => {
    if (!enabledRef.current) return;
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
    [
      groupedSongs,
      cursorPosition,
      arePlaylistsVisible,
      appliedFilters,
      blockBack,
      onEnterToolbar,
      onEnterSongGroupsNav,
    ],
  );

  const help = useMemo<HelpEntry>(
    () => ({
      mode: 'song-selection',
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

  const closePlaylist = useCallback((newLeavingKey?: 'left' | 'right') => {
    setShowPlaylistsState([false, newLeavingKey ?? null]);
    // if (leavingKey === 'right') navigateHorizontally(1);
  }, []);

  useLayoutEffect(() => {
    const [previousShowFilters, enteringKey] = previousPlaylistsState;
    if (previousShowFilters && !arePlaylistsVisible) {
      if (enteringKey === leavingKey) navigateHorizontally(leavingKey === 'right' ? 1 : -1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the playlist-visibility/cursor transition; `navigateHorizontally` is recreated each render and `previousPlaylistsState` is read intentionally
  }, [arePlaylistsVisible, leavingKey, isAtFirstColumn, isAtLastColumn, ...cursorPosition]);

  return [selectedSongId, moveToSong, arePlaylistsVisible, closePlaylist, randomSong] as const;
};
