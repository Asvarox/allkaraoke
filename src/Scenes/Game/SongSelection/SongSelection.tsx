import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { focusable } from '../../../Elements/cssMixins';
import useKeyboardNav from '../../../Hooks/useKeyboardNav';
import { SingSetup, SongPreview } from '../../../interfaces';
import styles from '../Singing/Drawing/styles';
import FocusedSong from './FocusedSong';

interface Props {
    onSongSelected: (songSetup: SingSetup) => void;
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
        (list.current?.childNodes[focusedSong] as HTMLDivElement)?.scrollIntoView?.({
            behavior: 'smooth',
            inline: 'center',
            block: 'center',
        });
    }, [list, focusedSong]);

    useEffect(() => {
        if (songList.data && preselectedSong) {
            const newIndex = songList.data.findIndex(song => song.file === preselectedSong);

            if (newIndex > -1) setFocusedSong(newIndex);
        }
    }, [songList.data, preselectedSong]);


    const getSongCount = () => songList?.data?.length ?? 1;

    const nagivateSong = (indexChange: number) => {
        setFocusedSong(i => {
            const change = (i + indexChange);

            return change >= getSongCount() || change < 0 ? i : change;
        });
    }
    useKeyboardNav({
        onEnter: () => setKeyboardControl(false),
        onDownArrow: () => nagivateSong(4),
        onUpArrow: () => nagivateSong(-4),
        onLeftArrow: () => nagivateSong(-1),
        onRightArrow: () => nagivateSong(+1),
    }, keyboardControl, [songList.data]);

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
                {songList.data.map((song, index) => (
                    <SongListEntry key={song.file} onClick={() => setFocusedSong(index)} video={song.video} focused={keyboardControl && index === focusedSong}>
                        
                            <SongListEntryDetailsArtist>{song.artist}</SongListEntryDetailsArtist>

                            <SongListEntryDetailsTitle>{song.title}</SongListEntryDetailsTitle>
                    </SongListEntry>
                ))}
            </SongListContainer>
        </SongSelectionContainer>
    );
}

const SongSelectionContainer = styled.div`
    margin: 0 auto;
    width: 1100px;
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: rgba(0,0,0,.5);
    padding: 0 20px;
`;

const SongListContainer = styled.div<{ active: boolean }>`
    flex: 1;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 20px;
    padding-bottom: 20px;
    overflow-y: scroll;
    ${props => !props.active && `
        filter: blur(5px);
    `}
`;

const SongListEntry = styled.div.attrs<{ video: string, focused: boolean }>(props => ({
    style: {
        backgroundImage: `url('https://i3.ytimg.com/vi/${props.video}/hqdefault.jpg')`,
    },
}))<{ video: string, focused: boolean }>`
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

    opacity: .8;
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
