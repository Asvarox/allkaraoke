import { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import styled from 'styled-components'
import { SongPreview } from "../../../interfaces";
import styles from "../Singing/Drawing/styles";

interface Props {
    songPreview: SongPreview;
    onPlay: () => void;
}

const previewWidth = 1100;
const previewHeight = 400;

export default function SongSelection({ songPreview, onPlay }: Props) {
    const [showImage, setShowImage] = useState(false);
    const player = useRef<YouTube | null>(null);

    const playerStart = songPreview.previewStart ?? ((songPreview.videoGap ?? 0) + 60);
    const playerEnd = songPreview.previewEnd ?? playerStart + 30;

    // useEffect(() => {
    //     const internalPlayer = player?.current?.getInternalPlayer();
    //     internalPlayer?.unmute?.();
    //     internalPlayer?.setVolume?.(100);
    // }, [player, songPreview])

    // useEffect(() => {
    //     setShowImage(false);
    // }, [songPreview])

    return <FocusedSongContainer video={songPreview.video}>
        <div style={{ opacity: !showImage ? 1: 0, transition: '500ms', marginTop: -(((previewWidth / 16 * 9) - previewHeight) / 2) }}>
            <YouTube
                ref={player}
                videoId={songPreview.video}
                opts={{
                    width: String(previewWidth),
                    height: (previewWidth / 16 * 9).toFixed(0),
                    playerVars: { autoplay: 1, start: playerStart, end: playerEnd, showinfo: 0, rel: 0, fs: 0, controls: 0, disablekb: 1 },
                }}

                onStateChange={({ data }) => {
                    if (data === YouTube.PlayerState.ENDED) {
                        setShowImage(true);
                    } else if (data === YouTube.PlayerState.PLAYING) {
                        setShowImage(false);
                    }
                }}
            />
        </div>
        <FocusedSongData>
            <div>
                <SongTitle>{songPreview.title}</SongTitle><br />
                <SongArtist>{songPreview.artist}</SongArtist><br />
                {songPreview.author && (
                    <SongCreator>
                        by&nbsp;
                        {songPreview.authorUrl ? <a href={songPreview.authorUrl}>{songPreview.author}</a> : songPreview.author}
                    </SongCreator>
                )}
            </div>
            <PlayButton onClick={onPlay}>Play <span style={{ fontSize: '40px' }}>»</span></PlayButton>
        </FocusedSongData>
    </FocusedSongContainer>
}

const FocusedSongContainer = styled.div<{ video: string }>(props => `
    position: sticky;
    top: 0;
    background: white;
    height: 400px;
    postion: relative;
    overflow-y: hidden;
    
    background-image: url('https://i3.ytimg.com/vi/${props.video}/hqdefault.jpg');
    background-size: cover;
    background-position: center center;
`);

const FocusedSongData = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    color: white;
    width: 100%;
    height: 100%;
`

const DataPiece = styled.span`
    background: rgba(0,0,0, .5);
    display: inline-block;
    backdrop-filter: blur(5px);
    -webkit-text-stroke: 1px black;
    padding: 5px 20px;
    margin: 0 0 10px 20px;
    font-weight: bold;

    a {
        text-decoration: none;
        -webkit-text-stroke: 1px black;
        color: ${styles.colors.text.active}
    }
`

const SongTitle = styled(DataPiece)`
    color: ${styles.colors.text.active};
    margin-top: 20px;
    font-size: 45px;
`;

const SongArtist = styled(DataPiece)`
    font-size: 35px;
`;

const SongCreator = styled(DataPiece)`
    font-size: 20px;
`

const PlayButton = styled.button`
    position: absolute;
    bottom: 20px;
    right: 20px;
    padding: 10px;
    font-size: 30px;
    font-weight: bold;
    display: block;
    text-align: center;
    cursor: pointer;
    backdrop-filter: blur(5px);
    border: 2px solid #018001;
    border-radius: 5px;
    
    color:  #ffffff;
    background-color: #005a007b;
    width: 250px;
    height: 50px;
    text-transform: uppercase;
    letter-spacing: 2px;
    line-height: 0;
    -webkit-text-stroke: 1px #018001;
`
