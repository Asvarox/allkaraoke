import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { navigate } from '../../../Hooks/useHashLocation';
import useKeyboardNav from '../../../Hooks/useKeyboardNav';
import { SongPreview } from '../../../interfaces';
import { menuBack, menuEnter, menuNavigate } from '../../../SoundManager';

const useKeyboardTwoDimensionalNavigation = (
    enabled: boolean,
    songList: SongPreview[],
    focusedSong: number,
    setFocusedSong: Dispatch<SetStateAction<number>>,
    onEnter: () => void,
) => {
    const getSongCount = () => songList.length ?? 1;

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

            return change >= getSongCount() || change < 0 ? i : change;
        });
    };
    useKeyboardNav(
        {
            onEnter: handleEnter,
            onDownArrow: () => navigateToSong(4),
            onUpArrow: () => navigateToSong(-4),
            onLeftArrow: () => navigateToSong(-1),
            onRightArrow: () => navigateToSong(+1),
            onBackspace: handleBackspace,
        },
        enabled,
        [songList],
    );
};

export default function useSongSelection(preselectedSong: string | null) {
    const [focusedSong, setFocusedSong] = useState<number>(0);
    const songList = useQuery<SongPreview[]>('songList', () =>
        fetch('./songs/index.json').then((response) => response.json()),
    );
    const [keyboardControl, setKeyboardControl] = useState(true);
    useKeyboardTwoDimensionalNavigation(keyboardControl, songList.data ?? [], focusedSong, setFocusedSong, () =>
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

    const groupedSongList = useMemo(() => {
        if (!songList.data) return [];

        const groups: Array<{ letter: string; songs: Array<{ index: number; song: SongPreview }> }> = [];

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

    return { groupedSongList, focusedSong, setFocusedSong, setKeyboardControl, keyboardControl, songPreview };
}
