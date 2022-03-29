import { throttle } from 'lodash';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { navigate } from '../../../Hooks/useHashLocation';
import useKeyboardNav from '../../../Hooks/useKeyboardNav';
import { SongPreview } from '../../../interfaces';
import { menuBack, menuEnter, menuNavigate } from '../../../SoundManager';

interface SongGroup {
    letter: string;
    songs: Array<{ index: number; song: SongPreview }>;
}

const useKeyboardTwoDimensionalNavigation = (
    enabled: boolean,
    songCount: number,
    groupedSongs: SongGroup[],
    focusedSong: number,
    setFocusedSong: Dispatch<SetStateAction<number>>,
    onEnter: () => void,
) => {
    const handleEnter = () => {
        menuEnter.play();
        onEnter();
    };

    const handleBackspace = () => {
        menuBack.play();
        navigate('/');
    };

    const navigateToSong = (indexChange: number) => {
        menuNavigate.play();
        setFocusedSong((i) => {
            const change = i + indexChange;

            return change >= songCount || change < 0 ? i : change;
        });
    };

    const navigateToGroup = useCallback(
        throttle(
            (direction: 1 | -1, currentGroup: number) => {
                const nextGroupIndex = (groupedSongs.length + currentGroup + direction) % groupedSongs.length;

                setFocusedSong(groupedSongs[nextGroupIndex].songs[0].index);
                menuNavigate.play();
            },
            700,
            { trailing: false },
        ),
        [groupedSongs],
    );

    const navigateVertically = ({ repeat }: KeyboardEvent, direction: 1 | -1) => {
        if (!repeat) {
            navigateToSong(4 * direction);
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
            onLeftArrow: () => navigateToSong(-1),
            onRightArrow: () => navigateToSong(+1),
            onBackspace: handleBackspace,
        },
        enabled,
        [songCount, groupedSongs, focusedSong],
    );
};

export default function useSongSelection(preselectedSong: string | null) {
    const [focusedSong, setFocusedSong] = useState<number>(0);
    const songList = useQuery<SongPreview[]>('songList', () =>
        fetch('./songs/index.json').then((response) => response.json()),
    );
    const [keyboardControl, setKeyboardControl] = useState(true);

    useEffect(() => {
        if (songList.data) navigate(`/game/${encodeURIComponent(songList.data[focusedSong].file)}`);
    }, [focusedSong, songList.data]);

    useEffect(() => {
        if (songList.data && preselectedSong) {
            const newIndex = songList.data.findIndex((song) => song.file === preselectedSong);

            if (newIndex > -1) setTimeout(() => setFocusedSong(newIndex));
        }
    }, [songList.data, preselectedSong]);

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

    const songPreview = songList.data?.[focusedSong];

    useKeyboardTwoDimensionalNavigation(
        keyboardControl,
        songList.data?.length ?? 0,
        groupedSongList,
        focusedSong,
        setFocusedSong,
        () => setKeyboardControl(false),
    );

    return { groupedSongList, focusedSong, setFocusedSong, setKeyboardControl, keyboardControl, songPreview };
}
