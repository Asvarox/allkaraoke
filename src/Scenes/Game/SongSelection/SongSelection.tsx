import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { focusable } from '../../../Elements/cssMixins';
import useKeyboardNav from '../../../Hooks/useKeyboardNav';
import { SingSetup, SongPreview } from '../../../interfaces';
import styles from '../Singing/Drawing/styles';
import FocusedSong from './FocusedSong';

interface Props {
    onSongSelected: (songSetup: SingSetup & { file: string; video: string }) => void;
    preselectedSong: string | null;
}

export default function SongSelection({ onSongSelected, preselectedSong }: Props) {
    const songList = useQuery<SongPreview[]>('songList', () =>
        fetch('./songs/index.json').then((response) => response.json()),
    );
    const [focusedSong, setFocusedSong] = useState<number>(0);
    const [keyboardControl, setKeyboardControl] = useState(true);

    const list = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        (list.current?.querySelector(`[data-index="${focusedSong}"]`) as HTMLDivElement)?.scrollIntoView?.({
            behavior: 'smooth',
            inline: 'center',
            block: 'center',
        });
        if (songList.data) window.location.hash = `/game/${encodeURIComponent(songList.data[focusedSong].file)}`;
    }, [list, focusedSong, songList.data]);

    useEffect(() => {
        if (songList.data && preselectedSong) {
            const newIndex = songList.data.findIndex((song) => song.file === preselectedSong);

            if (newIndex > -1) setFocusedSong(newIndex);
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

    if (!songList.data) return <>Loading</>;

    return (
        <SongSelectionContainer>
            <FocusedSong
                songPreview={songList.data[focusedSong]}
                onPlay={onSongSelected}
                keyboardControl={!keyboardControl}
                onExitKeyboardControl={() => setKeyboardControl(true)}
            />
            <SongListContainer ref={list} active={keyboardControl}>
                {groupedSongList.map((group) => (
                    <SongsGroupContainer key={group.letter}>
                        <SongsGroupHeader>{group.letter}</SongsGroupHeader>
                        <SongsGroup>
                            {group.songs.map(({ song, index }) => (
                                <SongListEntry
                                    key={song.file}
                                    onClick={() => setFocusedSong(index)}
                                    video={song.video}
                                    focused={keyboardControl && index === focusedSong}
                                    data-index={index}
                                    data-test={`song-${song.file}`}>
                                    <SongListEntryDetailsArtist>{song.artist}</SongListEntryDetailsArtist>

                                    <SongListEntryDetailsTitle>{song.title}</SongListEntryDetailsTitle>
                                </SongListEntry>
                            ))}
                        </SongsGroup>
                    </SongsGroupContainer>
                ))}
            </SongListContainer>
        </SongSelectionContainer>
    );
}

const SongSelectionContainer = styled.div`
    margin: 0 auto;
    width: 1100px;
    position: relative;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    padding: 0 20px;
    display: flex;
    flex-direction: column;
`;

const SongsGroupContainer = styled.div`
    position: relative;
`;

const SongsGroup = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
`;
const SongsGroupHeader = styled.div`
    display: inline-block;
    padding: 5px 10px;
    margin-bottom: 10px;
    font-size: 32px;
    position: sticky;
    z-index: 1;
    top: 0;
    font-weight: bold;
    color: ${styles.colors.text.active};
    -webkit-text-stroke: 0.5px black;
    background: rgba(0, 0, 0, 0.7);
`;

const SongListContainer = styled.div<{ active: boolean }>`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-height: 0px;
    gap: 10px;
    margin-top: 20px;
    padding-bottom: 20px;
    overflow-y: scroll;
    ${(props) =>
        !props.active &&
        `
        filter: blur(5px);
    `}
`;

const SongListEntry = styled.div.attrs<{ video: string; focused: boolean }>((props) => ({
    style: {
        backgroundImage: `url('https://i3.ytimg.com/vi/${props.video}/hqdefault.jpg')`,
    },
}))<{ video: string; focused: boolean }>`
    width: 260px;
    height: ${(260 / 16) * 9}px;
    cursor: pointer;
    background-size: cover;
    background-position: center center;

    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    flex-direction: column;

    border-radius: 5px;
    padding: 5px;
    box-sizing: border-box;

    opacity: 0.8;
    z-index: 0;
    transition: 200ms;
    box-shadow: inset 0px 0px 1px 1px black;
    ${focusable}
`;

const SongListEntryDetails = styled.span`
    background: rgba(0, 0, 0, 0.7);

    width: auto;
    display: inline-block;
    padding: 5px;
    margin: 5px 0 0 0;
    font-weight: bold;
    -webkit-text-stroke: 0.5px black;
    color: white;

    text-align: right;
`;

const SongListEntryDetailsArtist = styled(SongListEntryDetails)`
    color: ${styles.colors.text.active};
    font-size: 17px;
`;

const SongListEntryDetailsTitle = styled(SongListEntryDetails)`
    color: white;
    font-size: 19px;
`;
