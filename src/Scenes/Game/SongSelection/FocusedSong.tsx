import { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import styled from 'styled-components';
import useDebounce from '../../../Hooks/useDebounce';
import { SingSetup, SongPreview } from '../../../interfaces';
import SongPage from '../SongPage';
import SongSettings from './SongSettings';

interface Props {
    songPreview: SongPreview;
    onPlay: (setup: SingSetup & { file: string; video: string }) => void;
    keyboardControl: boolean;
    onExitKeyboardControl: () => void;
}

const previewWidth = 1100;
const previewHeight = 400;

export default function SongSelection({ songPreview, onPlay, keyboardControl, onExitKeyboardControl }: Props) {
    const [showVideo, setShowVideo] = useState(false);
    const player = useRef<YouTube | null>(null);

    const start = songPreview.previewStart ?? (songPreview.videoGap ?? 0) + 60;
    const [videoId, previewStart, previewEnd, volume] = useDebounce(
        [songPreview.video, start, songPreview.previewEnd ?? start + 30, songPreview.volume ?? 0.5],
        350,
    );

    useEffect(() => {
        player.current?.getInternalPlayer().setVolume(Math.round(volume * 100));
        player.current?.getInternalPlayer().loadVideoById({
            videoId: videoId,
            startSeconds: previewStart,
            endSeconds: previewEnd,
        });
    }, [videoId, player, previewStart, previewEnd, volume]);

    const vid = (
        <Video show={showVideo}>
            <YouTube
                ref={player}
                videoId={''}
                opts={{
                    width: String(previewWidth),
                    height: ((previewWidth / 16) * 9).toFixed(0),
                    playerVars: {
                        autoplay: 1,
                        start: 0,
                        end: 0,
                        showinfo: 0,
                        rel: 0,
                        fs: 0,
                        controls: 0,
                        disablekb: 1,
                    },
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

    return (
        <Sticky>
            <SongPage songData={songPreview} width={previewWidth} height={previewHeight} background={vid}>
                <SongSettings
                    key={songPreview.file}
                    songPreview={songPreview}
                    onPlay={onPlay}
                    onExitKeyboardControl={onExitKeyboardControl}
                    keyboardControl={keyboardControl}
                />
            </SongPage>
        </Sticky>
    );
}

const Sticky = styled.div``;

const Video = styled.div<{ show: boolean }>`
    opacity: ${({ show }) => (show ? 1 : 0)};
    transition: 500ms;
    margin-top: ${-(((previewWidth / 16) * 9 - previewHeight) / 2)}px;
`;
