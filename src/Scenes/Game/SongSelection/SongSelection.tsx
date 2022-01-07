import { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { SongPreview } from '../../../interfaces';
import styles from '../Singing/Drawing/styles';
import FocusedSong from './FocusedSong';

interface Props {
    onSongSelected: (preview: SongPreview) => void;
}

export default function SongSelection({ onSongSelected }: Props) {
    const [focusedSong, setFocusedSong] = useState<number>(0);

    const songList = useQuery<SongPreview[]>('songList', () =>
        fetch('./songs/index.json').then((response) => response.json()),
    );

    if (!songList.data) return <>Loading</>;

    return (
        <SongSelectionContainer>
            <FocusedSong
                songPreview={songList.data[focusedSong]}
                onPlay={() => onSongSelected(songList.data[focusedSong])}
            />
            <SongListContainer>
                {songList.data.map((song, index) => (
                    <SongListEntry key={song.file} onClick={() => setFocusedSong(index)} video={song.video} focused={index === focusedSong}>
                        {/* <SongListEntryImage src={`https://i3.ytimg.com/vi/${song.video}/maxresdefault.jpg`} alt="song video miniature" /> */}
                        <SongListEntryDetails>
                            <SongListEntryDetailsArtist>{song.artist}</SongListEntryDetailsArtist>
                            {song.title}
                        </SongListEntryDetails>
                    </SongListEntry>
                ))}
            </SongListContainer>
        </SongSelectionContainer>
    );
}

const SongSelectionContainer = styled.div`
    margin: 0 auto;
    margin-top: 30px;
    width: 1100px;
    position: relative;
`;

const SongListContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 20px;
`;

const SongListEntry = styled.div<{ video: string, focused: boolean }>`
    width: 260px;
    height: ${(260 / 16) * 9}px;
    cursor: pointer;
    background-image: url('https://i3.ytimg.com/vi/${({ video }) => video}/hqdefault.jpg');
    background-size: cover;
    background-position: center center;

    border-radius: 5px;

    display: flex;

    flex-direction: column;
    justify-content: flex-end;
    /* filter: sepia(0.5); */
    ${({ focused }) => focused && `
        // filter: sepia(0);
        // filter: sepia(0);
        // transform-origin: center;
        // transform: scale(1.1);
    `}
`;

const SongListEntryDetails = styled.div`
    border-radius: 5px;
    width: 100%;
    background: rgba(0, 0, 0, 0.5);

    text-align: right;
    padding: 3px;
    box-sizing: border-box;
    color: ${styles.colors.text.active};
    font-weight: bold;
    font-size: 18px;
    -webkit-text-stroke: 0.5px black;
`;

const SongListEntryDetailsArtist = styled.span`
    font-size: 15px;
    display: block;
    color: white;
`;
