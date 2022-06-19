import { focused } from 'Elements/cssMixins';
import VideoPlayer, { VideoPlayerRef, VideoState } from 'Elements/VideoPlayer';
import { SingSetup, SongPreview } from 'interfaces';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import useDebounce from '../../../hooks/useDebounce';
import useViewportSize from '../../../hooks/useViewportSize';
import styles from '../Singing/GameOverlay/Drawing/styles';
import { SongCard, SongCardContainer, SongListEntryDetailsArtist, SongListEntryDetailsTitle } from './SongCard';
import SongSettings from './SongSettings';

interface Props {
    songPreview: SongPreview;
    onPlay: (setup: SingSetup & { file: string; video: string }) => void;
    keyboardControl: boolean;
    onExitKeyboardControl: () => void;
    top: number;
    left: number;
    width: number;
    height: number;
    focusEffect: boolean;
}

const PREVIEW_LENGTH = 30;

export default function SongPreviewComponent({
    songPreview,
    top,
    left,
    width,
    height,
    keyboardControl,
    onExitKeyboardControl,
    onPlay,
    focusEffect,
}: Props) {
    const [showVideo, setShowVideo] = useState(false);
    const player = useRef<VideoPlayerRef | null>(null);
    const { width: windowWidth } = useViewportSize();

    const active = keyboardControl;

    // need to use layout effect otherwise newly selected song name is displayed briefly before the element is removed
    useLayoutEffect(() => {
        setShowVideo(false);
    }, [songPreview]);

    const start = songPreview.previewStart ?? (songPreview.videoGap ?? 0) + 60;
    const [videoId, previewStart, previewEnd, volume] = useDebounce(
        [songPreview.video, start, songPreview.previewEnd ?? start + PREVIEW_LENGTH, songPreview.volume],
        350,
    );

    useEffect(() => {
        player.current?.loadVideoById({
            videoId: videoId,
            startSeconds: previewStart,
            endSeconds: previewEnd,
        });
    }, [videoId, player, previewStart, previewEnd]);

    const finalWidth = active ? windowWidth! : width;
    const finalHeight = active ? (windowWidth! / 20) * 9 : height;

    useEffect(() => {
        player.current?.setSize(finalWidth, (finalWidth / 16) * 9);
    }, [finalWidth, keyboardControl]);

    return (
        <>
            {active && <Backdrop />}
            <SongPreviewContainer
                top={top}
                left={left}
                width={finalWidth}
                height={finalHeight}
                active={active}
                data-test="song-preview"
                data-song={songPreview.file}>
                <Content
                    width={finalWidth}
                    active={active}
                    focus={focusEffect}
                    blurBackground={active && !showVideo}
                    isVideoPlaying={showVideo}>
                    {(showVideo || active) && (
                        <>
                            <SongInfo active={active}>
                                <SongListEntryDetailsArtist>{songPreview.artist}</SongListEntryDetailsArtist>
                                <SongListEntryDetailsTitle>{songPreview.title}</SongListEntryDetailsTitle>
                                {active && songPreview.author && (
                                    <SongAuthor>
                                        by&nbsp;
                                        {songPreview.authorUrl ? (
                                            <a href={songPreview.authorUrl}>{songPreview.author}</a>
                                        ) : (
                                            songPreview.author
                                        )}
                                    </SongAuthor>
                                )}
                            </SongInfo>
                            {active && (
                                <SongSettings
                                    songPreview={songPreview}
                                    onPlay={onPlay}
                                    keyboardControl={keyboardControl}
                                    onExitKeyboardControl={onExitKeyboardControl}
                                />
                            )}
                        </>
                    )}
                </Content>
                <Video
                    show={showVideo}
                    active={keyboardControl}
                    height={finalHeight}
                    width={finalWidth}
                    video={songPreview.video}>
                    <VideoPlayer
                        width={0}
                        height={0}
                        disablekb
                        ref={player}
                        video={''}
                        volume={volume}
                        onStateChange={(state) => {
                            if (state === VideoState.ENDED) {
                                player.current?.seekTo(start);
                                player.current?.playVideo();
                            } else if (state === VideoState.PLAYING) {
                                setShowVideo(true);
                            }
                        }}
                    />
                </Video>
            </SongPreviewContainer>
        </>
    );
}

const SongPreviewContainer = styled.div.attrs<{
    top: number;
    left: number;
    active: boolean;
    width: number;
    height: number;
}>((props) => ({
    style: {
        top: props.active ? `calc(50vh - ${props.height}px / 2)` : props.top,
        left: props.active ? 0 : props.left,
    },
}))<{ top: number; left: number; width: number; height: number; active: boolean }>`
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
    position: absolute;
    z-index: 3;
    overflow: hidden;
    padding: 0;

    ${(props) => (props.active ? 'position: fixed;' : 'transform: scale(1.2);')}
    ${(props) => !props.active && 'pointer-events: none;'}
`;

const Backdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.8);
    width: 100vw;
    height: 100vh;
    z-index: 2;
`;

const Video = styled(SongCard)<{ show: boolean; active: boolean; height: number }>`
    div {
        opacity: ${({ show }) => (show ? 1 : 0)};
        transition: ${({ show, active }) => (show || active ? 700 : 0)}ms;
    }
    ${(props) => !props.active && 'background-image: none !important;'}
    ${(props) => props.active && `margin-top: calc(-1 * (100vw / 16 * 9) / 2 + ${props.height / 2}px);`}
`;

const Content = styled(SongCardContainer)<{
    active: boolean;
    blurBackground: boolean;
    isVideoPlaying: boolean;
    focus: boolean;
}>`
    position: absolute;
    z-index: 100;
    width: 100%;
    height: 100%;
    padding: ${(props) => (props.active ? '0.25em' : '0.5em')};
    ${(props) => props.blurBackground && 'backdrop-filter: blur(10px);'}

    ${(props) => props.focus && !props.active && props.isVideoPlaying && focused}
`;

const SongInfo = styled.div<{ active: boolean }>`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    flex-direction: column;

    ${(props) =>
        props.active &&
        `
        align-items: flex-start;
        justify-content: flex-start;
        font-size: .5em;
    `}
`;

const SongAuthor = styled(SongListEntryDetailsTitle)`
    font-size: 0.5em;
    margin-top: 0.5em;

    a {
        text-decoration: none;
        -webkit-text-stroke: 1px black;
        color: ${styles.colors.text.active};
    }
`;
