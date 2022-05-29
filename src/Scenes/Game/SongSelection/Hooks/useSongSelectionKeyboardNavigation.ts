import { navigate } from 'hooks/useHashLocation';
import useKeyboard from 'hooks/useKeyboard';
import { chunk, throttle } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { menuBack, menuEnter, menuNavigate } from 'SoundManager';
import useKeyboardHelp from '../../../../hooks/useKeyboardHelp';
import usePrevious from '../../../../hooks/usePrevious';
import tuple from '../../../../utils/tuple';
import { SongGroup } from './useSongList';

const MAX_SONGS_PER_ROW = 4;

const useTwoDimensionalNavigation = (groups: SongGroup[] = []) => {
    const [cursorPosition, setCursorPosition] = useState<[number, number]>([0, 0]);
    const songIndexMatrix = useMemo(
        () =>
            groups
                .map(({ songs }) =>
                    chunk(
                        songs.map((song) => song.index),
                        MAX_SONGS_PER_ROW,
                    ),
                )
                .flat(),
        [groups],
    );
    const previousMatrix = usePrevious(songIndexMatrix ?? []);

    const moveToSong = (songIndex: number, matrix: number[][] = songIndexMatrix) => {
        const y = matrix.findIndex((columns) => columns.includes(songIndex));
        const x = matrix[y]?.indexOf(songIndex);
        if (x >= 0 && y >= 0) {
            setCursorPosition([x ?? 0, y ?? 0]);
        }
    };

    const positionToSongIndex = ([x, y]: [number, number], matrix: number[][] = songIndexMatrix) => {
        if (groups.length === 0) return 0;
        const row = matrix[y];
        return row?.[x] ?? row?.at(-1) ?? matrix?.[0]?.[0] ?? 0;
    };

    useEffect(() => {
        const previousFocusedSong = positionToSongIndex(cursorPosition, previousMatrix);
        const currentFocusedSong = positionToSongIndex(cursorPosition, songIndexMatrix);
        if (previousFocusedSong !== currentFocusedSong) {
            moveToSong(previousFocusedSong);
        }
    }, [cursorPosition, songIndexMatrix, songIndexMatrix]);

    const moveCursor = (plane: 'x' | 'y', delta: number) => {
        menuNavigate.play();
        setCursorPosition(([x, y]) => {
            let newX = x;
            let newY = y;
            if (plane === 'y') {
                newY = y + delta;
            } else {
                if (songIndexMatrix[y] === undefined) {
                    console.log('ERROR', songIndexMatrix, x, y, delta);
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
            return [newX % MAX_SONGS_PER_ROW, (songIndexMatrix.length + newY) % songIndexMatrix.length];
        });
    };

    const focusedSong = positionToSongIndex(cursorPosition);

    return tuple([focusedSong, cursorPosition, moveCursor, moveToSong]);
};

export const useSongSelectionKeyboardNavigation = (
    enabled: boolean,
    groupedSongs: SongGroup[] = [],
    onEnter: () => void,
) => {
    const [showFilters, setShowFilters] = useState(false);
    const [focusedSong, cursorPosition, moveCursor, moveToSong] = useTwoDimensionalNavigation(groupedSongs);

    const handleEnter = () => {
        menuEnter.play();
        onEnter();
    };

    const handleBackspace = () => {
        menuBack.play();
        navigate('/');
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

    const navigateVertically = ({ repeat }: KeyboardEvent, direction: 1 | -1) => {
        if (!repeat) {
            moveCursor('y', direction);
        } else {
            const currentlySelectedGroupIndex = groupedSongs.findIndex(
                (group) => !!group.songs.find((song) => song.index === focusedSong),
            );
            navigateToGroup(direction, currentlySelectedGroupIndex);
        }
    };

    const setPositionBySongIndex = (songIndex: number) => moveToSong(songIndex);

    useKeyboard(
        {
            onEnter: handleEnter,
            onDownArrow: (e) => navigateVertically(e, 1),
            onUpArrow: (e) => navigateVertically(e, -1),
            onLeftArrow: () => moveCursor('x', -1),
            onRightArrow: () => moveCursor('x', 1),
            onBackspace: handleBackspace,
            onLetterF: () => setShowFilters((current) => !current),
        },
        enabled && !showFilters,
        [groupedSongs, cursorPosition, showFilters],
    );

    const { setHelp, clearHelp } = useKeyboardHelp();

    useEffect(() => {
        if (enabled) {
            setHelp({
                'horizontal-vertical': null,
                accept: null,
                back: null,
                letterF: 'Filter list',
            });
        }

        return clearHelp;
    }, [enabled]);

    return tuple([focusedSong, setPositionBySongIndex, showFilters, setShowFilters]);
};
