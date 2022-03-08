import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import useKeyboardNav from '../../../Hooks/useKeyboardNav';
import { SongPreview } from '../../../interfaces';

export default function useSongSelection(preselectedSong: string | null) {
    const songList = useQuery<SongPreview[]>('songList', () =>
        fetch('./songs/index.json').then((response) => response.json()),
    );
    const [focusedSong, setFocusedSong] = useState<number>(0);
    const [keyboardControl, setKeyboardControl] = useState(true);

    useEffect(() => {
        if (songList.data) window.location.hash = `/game/${encodeURIComponent(songList.data[focusedSong].file)}`;
    }, [focusedSong, songList.data]);

    useEffect(() => {
        if (songList.data && preselectedSong) {
            const newIndex = songList.data.findIndex((song) => song.file === preselectedSong);

            if (newIndex > -1) setTimeout(() => setFocusedSong(newIndex));
        }
    }, [songList.data, preselectedSong]);

    const getSongCount = () => songList?.data?.length ?? 1;

    const nagivateSong = (indexChange: number) => {
        setFocusedSong((i) => {
            const change = i + indexChange;

            return change >= getSongCount() || change < 0 ? i : change;
        });
    };
    useKeyboardNav(
        {
            onEnter: () => setKeyboardControl(false),
            onDownArrow: () => nagivateSong(4),
            onUpArrow: () => nagivateSong(-4),
            onLeftArrow: () => nagivateSong(-1),
            onRightArrow: () => nagivateSong(+1),
        },
        keyboardControl,
        [songList.data],
    );
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
