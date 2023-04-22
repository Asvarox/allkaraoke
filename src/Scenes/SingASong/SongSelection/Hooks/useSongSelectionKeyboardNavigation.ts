import useKeyboard from 'hooks/useKeyboard';
import { chunk, throttle } from 'lodash-es';
import posthog from 'posthog-js';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { menuBack, menuEnter, menuNavigate } from 'SoundManager';
import { randomInt } from 'utils/randomValue';
import useKeyboardHelp from 'hooks/useKeyboardHelp';
import usePrevious from 'hooks/usePrevious';
import tuple from 'utils/tuple';
import { AppliedFilters, SongGroup } from 'Scenes/SingASong/SongSelection/Hooks/useSongList';
import useSmoothNavigate from 'hooks/useSmoothNavigate';

const useTwoDimensionalNavigation = (groups: SongGroup[] = [], itemsPerRow: number) => {
    const [cursorPosition, setCursorPosition] = useState<[number, number]>([0, 0]);
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
        [groups],
    );
    const songGroupMatrix = useMemo(
        () =>
            groups
                .map(({ songs, letter }) =>
                    chunk(
                        songs.map(() => letter),
                        itemsPerRow,
                    ),
                )
                .flat(),
        [groups],
    );
    const previousMatrix = usePrevious(songIndexMatrix ?? []);

    const isAtLastColumn = cursorPosition[0] === songIndexMatrix[cursorPosition[1]]?.length - 1;

    const moveToSong = useCallback(
        (songIndex: number) => {
            const y = songIndexMatrix.findIndex((columns) => columns.includes(songIndex));
            const x = songIndexMatrix[y]?.indexOf(songIndex);
            if (x >= 0 && y >= 0) {
                setCursorPosition([x ?? 0, y ?? 0]);
            } else {
                setCursorPosition([0, 0]);
            }
        },
        [songIndexMatrix],
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

    const handleBackspace = () => {
        if (!appliedFilters.search) {
            menuBack.play();
            navigate('/');
        }
    };

    const navigateToGroup = useCallback(
        throttle(
            (direction: 1 | -1, currentGroup: number) => {
                const nextGroupIndex = (groupedSongs.length + currentGroup + direction) % groupedSongs.length;

                moveToSong(groupedSongs[nextGroupIndex].songs[0].index);
                menuNavigate.play();
            },
            700,
            { trailing: false },
        ),
        [groupedSongs],
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
        if (!ignoreFilters && direction === 1 && isAtLastColumn && !arePlaylistsVisible) {
            setShowPlaylistsState([true, 'right']);
        } else if (!ignoreFilters && direction === -1 && isAtFirstColumn && !arePlaylistsVisible) {
            setShowPlaylistsState([true, 'left']);
        } else {
            moveCursor('x', direction);
        }
    };

    const randomSong = () => {
        const newIndex = randomInt(0, songCount - 1);
        moveToSong(newIndex);
    };

    useKeyboard(
        {
            onEnter: handleEnter,
            onDownArrow: (e) => navigateVertically(e, 1),
            onUpArrow: (e) => navigateVertically(e, -1),
            onLeftArrow: () => navigateHorizontally(-1),
            onRightArrow: () => navigateHorizontally(1),
            onBackspace: handleBackspace,
            onR: () => {
                randomSong();
                posthog.capture('selectRandom');
            },
        },
        enabled && !arePlaylistsVisible,
        [groupedSongs, cursorPosition, arePlaylistsVisible, appliedFilters],
    );

    const help = useMemo(
        () => ({
            'horizontal-vertical': null,
            accept: null,
            back: null,
            shiftR: null,
        }),
        [],
    );
    useKeyboardHelp(help, enabled);

    const closePlaylist = useCallback(
        (leavingKey: 'left' | 'right') => {
            setShowPlaylistsState([false, leavingKey]);
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

    return tuple([focusedSong, focusedGroup, moveToSong, arePlaylistsVisible, closePlaylist]);
};
