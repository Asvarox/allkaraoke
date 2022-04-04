import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { focused } from '../../../Elements/cssMixins';
import useViewportSize from '../../../Hooks/useViewportSize';
import { SingSetup } from '../../../interfaces';
import styles from '../Singing/GameOverlay/Drawing/styles';
import { SongCard, SongListEntryDetailsArtist, SongListEntryDetailsTitle } from './SongCard';
import SongPreview from './SongPreview';
import useSongSelection from './useSongSelection';

interface Props {
    onSongSelected: (songSetup: SingSetup & { file: string; video: string }) => void;
    preselectedSong: string | null;
}

const padding = 50;
const leftPad = 50;
const gap = 40;
const perRow = 4;

const focusMultiplier = 1.2;

export default function SongSelection({ onSongSelected, preselectedSong }: Props) {
    const [{ previewTop, previewLeft }, setPositions] = useState({ previewTop: 0, previewLeft: 0 });
    const { focusedSong, setFocusedSong, groupedSongList, keyboardControl, songPreview, setKeyboardControl } =
        useSongSelection(preselectedSong);
    const list = useRef<HTMLDivElement | null>(null);
    const { width, handleResize } = useViewportSize();

    useEffect(() => {
        handleResize(); // Recalculate width/height to account possible scrollbar appearing

        const song = list.current?.querySelector(`[data-index="${focusedSong}"]`) as HTMLDivElement;
        if (song) {
            song.scrollIntoView?.({
                behavior: 'smooth',
                inline: 'center',
                block: 'center',
            });
            setPositions({ previewLeft: song.offsetLeft, previewTop: song.offsetTop });
        }
    }, [width, list, focusedSong, groupedSongList]);

    const onSongClick = (index: number) => (focusedSong === index ? setKeyboardControl(false) : setFocusedSong(index));
    if (!groupedSongList || !width) return <>Loading</>;

    const entryWidth = (width - leftPad - padding - gap * (perRow - 1)) / perRow;
    const entryHeight = (entryWidth / 16) * 9;

    return (
        <SongListContainer ref={list} active={keyboardControl}>
            {songPreview && (
                <SongPreview
                    songPreview={songPreview}
                    onPlay={onSongSelected}
                    keyboardControl={!keyboardControl}
                    onExitKeyboardControl={() => setKeyboardControl(true)}
                    top={previewTop}
                    left={previewLeft}
                    width={entryWidth}
                    height={entryHeight}
                />
            )}
            {groupedSongList.map((group) => (
                <SongsGroupContainer key={group.letter}>
                    <SongsGroupHeader>{group.letter}</SongsGroupHeader>
                    <SongsGroup>
                        {group.songs.map(({ song, index }) => (
                            <SongListEntry
                                width={entryWidth}
                                height={entryHeight}
                                key={song.file}
                                onClick={() => onSongClick(index)}
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
    );
}

const SongsGroupContainer = styled.div``;

const SongsGroup = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: ${gap}px;
`;
const SongsGroupHeader = styled.div`
    display: inline-block;
    padding: 5px 10px;
    margin-bottom: 20px;
    font-size: 32px;
    position: sticky;
    z-index: 1;
    top: -${gap}px;
    font-weight: bold;
    color: ${styles.colors.text.active};
    -webkit-text-stroke: 0.5px black;
    background: rgba(0, 0, 0, 0.7);
`;

const SongListContainer = styled.div<{ active: boolean }>`
    position: relative;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: ${gap}px;
    padding: ${padding}px;
    padding-left: ${leftPad}px;
    overflow-y: overlay;
    max-height: 100vh;
    box-sizing: border-box;
`;

const SongListEntry = styled(SongCard)<{ video: string; focused: boolean; width: number; height: number }>`
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
    background-color: rgb(52, 80, 107);

    padding: 0.5em;

    transition: 200ms;

    background-blend-mode: ${(props) => (props.focused ? 'normal' : 'luminosity')};
    transform: scale(${(props) => (props.focused ? focusMultiplier : 1)});
    ${(props) => props.focused && 'z-index: 2;'}
    ${(props) => props.focused && focused}
`;
