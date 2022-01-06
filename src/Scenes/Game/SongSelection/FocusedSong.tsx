import { useRef, useState } from 'react';
import YouTube from 'react-youtube';
import styled from 'styled-components'
import { Button } from '../../../Elements/Button';
import { SongPreview } from "../../../interfaces";
import SongPage from '../SongPage';

interface Props {
    songPreview: SongPreview;
    onPlay: () => void;
}

const previewWidth = 1100;
const previewHeight = 400;

export default function SongSelection({ songPreview, onPlay }: Props) {
    const [showVideo, setShowVideo] = useState(false);
    const player = useRef<YouTube | null>(null);

    const playerStart = songPreview.previewStart ?? ((songPreview.videoGap ?? 0) + 60);
    const playerEnd = songPreview.previewEnd ?? playerStart + 30;

    const vid = (
        <Video show={showVideo}>
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
                        setShowVideo(false);
                    } else if (data === YouTube.PlayerState.PLAYING) {
                        setShowVideo(true);
                    }
                }}
            />
        </Video>
    );

    return <Sticky><SongPage songData={songPreview} width={previewWidth} height={previewHeight} background={vid}>
        <PlayButton onClick={onPlay}>Play <span style={{ fontSize: '40px' }}>»</span></PlayButton>
    </SongPage></Sticky>
}

const Sticky = styled.div`
    position: sticky;
    top: 0;
`;

const Video = styled.div<{ show: boolean }>`
    opacity: ${({ show }) => show ? 1: 0};
    transition: 500ms;
    margin-top: ${-(((previewWidth / 16 * 9) - previewHeight) / 2)}px;
`

const PlayButton = styled(Button)`
    position: absolute;
    bottom: 20px;
    right: 20px;
`
