import styled from '@emotion/styled';
import VideoPlayer, { VideoPlayerRef, VideoState } from 'Elements/VideoPlayer';
import { SingSetup, SongPreview } from 'interfaces';
import { ComponentProps, PropsWithChildren, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSongStats } from 'Songs/stats/hooks';
import useDebounce from 'hooks/useDebounce';
import useViewportSize from 'hooks/useViewportSize';
import {
    SongCard,
    SongCardBackground,
    SongCardContainer,
    SongCardStatsIndicator,
    SongListEntryDetailsArtist,
    SongListEntryDetailsTitle,
} from 'Scenes/SingASong/SongSelection/SongCard';
import SongSettings from 'Scenes/SingASong/SongSelection/SongSettings';

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
    const { width: windowWidth, height: windowHeight } = useViewportSize();

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
    const finalHeight = active ? Math.min((windowWidth! / 20) * 9, windowHeight! * (4 / 5)) : height;

    useEffect(() => {
        player.current?.setSize(finalWidth, (finalWidth / 16) * 9);
    }, [finalWidth, keyboardControl]);

    return (
        <>
            {active && <Backdrop onClick={onExitKeyboardControl} />}
            {!active && showVideo && (
                <SongBPMIndicator width={finalWidth} height={finalHeight} left={left} top={top} song={songPreview} />
            )}
            <SongPreviewContainer
                song={songPreview}
                top={top}
                left={left}
                width={finalWidth}
                height={finalHeight}
                showVideo={showVideo}
                active={active}
                data-test="song-preview"
                data-song={songPreview.file}>
                <Content
                    width={finalWidth}
                    height={finalHeight}
                    active={active}
                    focus={focusEffect}
                    blurBackground={active && !showVideo}
                    isVideoPlaying={showVideo}>
                    {(showVideo || active) && (
                        <>
                            <SongInfo active={active}>
                                {!active && <SongCardStatsIndicator song={songPreview} />}
                                <SongListEntryDetailsArtist active={active}>
                                    {songPreview.artist}
                                </SongListEntryDetailsArtist>
                                <SongListEntryDetailsTitle active={active}>
                                    {songPreview.title}
                                </SongListEntryDetailsTitle>
                                {active && (
                                    <>
                                        {songPreview.author && (
                                            <SongAuthor active={active}>
                                                by&nbsp;
                                                {songPreview.authorUrl ? (
                                                    <a href={songPreview.authorUrl} target="_blank" rel="noreferrer">
                                                        {songPreview.author}
                                                    </a>
                                                ) : (
                                                    songPreview.author
                                                )}
                                            </SongAuthor>
                                        )}
                                        <SongListEntryStats song={songPreview} />
                                    </>
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
                {active && (
                    <>
                        <SongCardBackground
                            video={songPreview.video}
                            focused
                            style={{
                                backgroundImage: `url('https://i3.ytimg.com/vi/${songPreview.video}/hqdefault.jpg')`,
                            }}
                        />
                    </>
                )}
                <Video show={showVideo} active={keyboardControl} height={finalHeight}>
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

const BaseSongPreviewContainer = styled.div<{ width: number; height: number; active: boolean; showVideo: boolean }>`
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
    position: absolute;
    z-index: 3;
    overflow: hidden;
    padding: 0;

    ${(props) => props.active && 'position: fixed;'};
    ${(props) => !props.active && props.showVideo && 'animation: rhythmPulse 1s infinite'};
    ${(props) => !props.active && 'pointer-events: none;'}
    ${(props) => !props.active && 'border-radius: 0.5rem;'}


    @keyframes rhythmPulse {
        0% {
            transform: scale(1.2);
        }
        25% {
            transform: scale(1.25);
        }
        50% {
            transform: scale(1.2);
        }
        100% {
            transform: scale(1.2);
        }
    }
`;

interface SongPreviewContainerProps
    extends ComponentProps<typeof BaseSongPreviewContainer>,
        PropsWithChildren<{
            top: number;
            left: number;
            song: SongPreview;
        }> {}

const SongPreviewContainer = (props: SongPreviewContainerProps) => {
    const realBpm = props.song.realBpm ?? (props.song.bpm > 300 ? props.song.bpm / 4 : props.song.bpm / 2);

    return (
        <BaseSongPreviewContainer
            style={{
                top: props.active ? `calc(50vh - ${props.height}px / 2)` : props.top,
                left: props.active ? 0 : props.left,
                animationDuration: `${60 / realBpm}s`,
            }}
            {...props}
        />
    );
};

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
        transition: ${({ show, active }) => (show || active ? 1000 : 0)}ms;
    }
    ${(props) => !props.active && 'background-image: none !important;'}
    ${(props) => !props.active && 'border-radius: 0.5rem;'}
    ${(props) => props.active && `margin-top: calc(-1 * (100vw / 16 * 9) / 2 + ${props.height / 2}px);`}
`;

const ContentBase = styled(SongCardContainer)<{
    active: boolean;
    blurBackground: boolean;
    isVideoPlaying: boolean;
    focus: boolean;
}>`
    position: fixed; /* makes sure Autocomplete dropdown doesn't get clipped */
    z-index: 100;
    padding: ${(props) => (props.active ? '3.1rem' : '1.3rem')};
    ${(props) => props.blurBackground && 'backdrop-filter: blur(1rem);'}

    ${(props) => props.focus && !props.active && props.isVideoPlaying && 'border: 0.1rem solid black;'}
    border-radius: 0.5rem;
`;

const Content = (props: ComponentProps<typeof ContentBase> & { width: number; height: number }) => (
    <ContentBase
        {...props}
        style={{
            width: props.width,
            height: props.height,
        }}
    />
);

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
    `}
`;

const SongAuthor = styled(SongListEntryDetailsTitle)`
    font-size: 3rem;
    margin-top: 3rem;
`;

export const SongListEntryStats = ({ song }: { song: SongPreview }) => {
    const stats = useSongStats(song);

    return (
        <SongAuthor>
            {stats?.plays ? `Played ${stats.plays} time${stats.plays > 1 ? 's' : ''}` : 'Never played yet'}
        </SongAuthor>
    );
};

const BaseSongBPMIndicator = styled.div<{ width: number; height: number }>`
    background: white;
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
    z-index: 2;
    top: 0;
    left: 0;
    position: absolute;
    animation: bpm 1s infinite;
    border-radius: 0.5rem;
    pointer-events: none;

    @keyframes bpm {
        0% {
            transform: scale(1.15);
            opacity: 1;
        }
        100% {
            transform: scale(1.45);
            opacity: 0;
        }
    }
`;

const SongBPMIndicator = (
    props: {
        top: number;
        left: number;
        song: SongPreview;
    } & ComponentProps<typeof BaseSongBPMIndicator>,
) => {
    const realBpm = props.song.realBpm ?? (props.song.bpm > 300 ? props.song.bpm / 4 : props.song.bpm / 2);
    return (
        <BaseSongBPMIndicator
            width={props.width}
            height={props.height}
            style={{
                left: props.left,
                top: props.top,
                animationDuration: `${60 / realBpm}s`,
            }}
        />
    );
};
