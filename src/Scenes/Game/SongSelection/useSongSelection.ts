import { chunk, throttle } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { navigate } from '../../../Hooks/useHashLocation';
import useKeyboardNav from '../../../Hooks/useKeyboardNav';
import { SongPreview } from '../../../interfaces';
import { menuBack, menuEnter, menuNavigate } from '../../../SoundManager';
import tuple from '../../../Utils/tuple';

const MAX_SONGS_PER_ROW = 4;

interface SongGroup {
    letter: string;
    songs: Array<{ index: number; song: SongPreview }>;
}

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

    const moveToSong = (songIndex: number) => {
        const y = songIndexMatrix.findIndex((columns) => columns.includes(songIndex));
        const x = songIndexMatrix[y]?.indexOf(songIndex);

        setCursorPosition([x ?? 0, y ?? 0]);
    };

    const positionToSongIndex = ([x, y]: [number, number]) => {
        if (groups.length === 0) return 0;
        const row = songIndexMatrix[y];
        return row[x] ?? row.at(-1) ?? 0;
    };

    const moveCursor = (plane: 'x' | 'y', delta: number) => {
        menuNavigate.play();
        setCursorPosition(([x, y]) => {
            let newX = x;
            let newY = y;
            if (plane === 'y') {
                newY = y + delta;
            } else {
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

const useKeyboardTwoDimensionalNavigation = (
    enabled: boolean,
    groupedSongs: SongGroup[] = [],
    onEnter: () => void,
): [number, (songIndex: number) => void] => {
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

    useKeyboardNav(
        {
            onEnter: handleEnter,
            onDownArrow: (e) => navigateVertically(e, 1),
            onUpArrow: (e) => navigateVertically(e, -1),
            onLeftArrow: () => moveCursor('x', -1),
            onRightArrow: () => moveCursor('x', 1),
            onBackspace: handleBackspace,
        },
        enabled,
        [groupedSongs, cursorPosition],
    );

    const setPositionBySongIndex = (songIndex: number) => moveToSong(songIndex);

    return [focusedSong, setPositionBySongIndex];
};

export default function useSongSelection(preselectedSong: string | null) {
    const songList = useQuery<SongPreview[]>('songList', () =>
        fetch('./songs/index.json').then((response) => response.json()),
    );
    const [keyboardControl, setKeyboardControl] = useState(true);

    const groupedSongList = useMemo(() => {
        if (!songList.data) return [];

        const groups: SongGroup[] = [];

        songList.data.forEach((song, index) => {
            const firstCharacter = isFinite(+song.artist[0]) ? '0-9' : song.artist[0].toUpperCase();
            let group = groups.find((group) => group.letter === firstCharacter);
            if (!group) {
                group = { letter: firstCharacter, songs: [] };
                groups.push(group);
            }

            group.songs.push({ index, song });
        });

        return groups;
    }, [songList.data]);

    const [focusedSong, setFocusedSong] = useKeyboardTwoDimensionalNavigation(keyboardControl, groupedSongList, () =>
        setKeyboardControl(false),
    );

    useEffect(() => {
        if (songList.data) navigate(`/game/${encodeURIComponent(songList.data[focusedSong].file)}`);
    }, [focusedSong, songList.data]);

    useEffect(() => {
        if (songList.data && preselectedSong) {
            const newIndex = songList.data.findIndex((song) => song.file === preselectedSong);

            if (newIndex > -1) setTimeout(() => setFocusedSong(newIndex));
        }
    }, [songList.data, preselectedSong]);

    const songPreview = songList.data?.[focusedSong];
    return { groupedSongList, focusedSong, setFocusedSong, setKeyboardControl, keyboardControl, songPreview };
}
