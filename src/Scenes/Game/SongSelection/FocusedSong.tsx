import YouTube from 'react-youtube';
import styled from 'styled-components'
import { SongPreview } from "../../../interfaces";
import styles from "../Singing/Drawing/styles";

interface Props {
    songPreview: SongPreview;
    onPlay: () => void;
}

export default function SongSelection({ songPreview, onPlay }: Props) {
    const playerStart = songPreview.previewStart ?? ((songPreview.videoGap ?? 0) + 60);
    const playerEnd = songPreview.previewEnd ?? playerStart + 30;

    return <FocusedSongContainer>
        <YouTube
            videoId={songPreview.video}
            opts={{
                width: '540',
                height: (540 / 16 * 9).toFixed(0),
                playerVars: { autoplay: 1, start: playerStart, end: playerEnd, showinfo: 0, rel: 0, fs: 0, controls: 0 },
            }}
        />
        <FocusedSongData>
            <div>
                <h2>{songPreview.title}</h2>
                <h3>{songPreview.artist}</h3>
            </div>
            <PlayButton onClick={onPlay}>Play</PlayButton>
        </FocusedSongData>
    </FocusedSongContainer>
}

const FocusedSongContainer = styled.div`
    display: flex;
    flex-direction: row;
    position: sticky;
    top: 0;
    background: white;
`

const FocusedSongData = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-left: 20px;
`

const PlayButton = styled.button`
    border: none;
    border-radius: 3px;
    background-color: green;
    padding: 10px;
    font-size: 20px;
    font-weight: bold;
    display: block;
    text-align: center;
    cursor: pointer;
`

const LargeImage = styled.img`
    width: 400px;
    height: 225px;
    object-fit: cover;
`