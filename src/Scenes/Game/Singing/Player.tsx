import { SingSetup, Song } from 'interfaces';
import { ForwardedRef, forwardRef, MutableRefObject, useEffect, useImperativeHandle, useRef, useState } from 'react';

import VideoPlayer, { VideoPlayerRef, VideoState } from 'Elements/VideoPlayer';
import styled from 'styled-components';
import PauseMenu from './GameOverlay/Components/PauseMenu';
import GameOverlay from './GameOverlay/GameOverlay';
import GameState from './GameState/GameState';

interface Props {
    singSetup: SingSetup;
    song: Song;
    width: number;
    height: number;
    autoplay?: boolean;
    showControls?: boolean;
    onTimeUpdate?: (newTime: number) => void;
    onSongEnd?: () => void;
    onStatusChange?: (status: VideoState) => void;
    tracksForPlayers: [number, number];
    playerChanges?: number[][];

    effectsEnabled?: boolean;
}

export interface PlayerRef {
    play: () => void;
    seekTo: (time: number) => void;
    setPlaybackSpeed: (speed: number) => void;
}

function usePlayerSetDuration(playerRef: MutableRefObject<VideoPlayerRef | null>, currentStatus: VideoState) {
    const [duration, setDuration] = useState(0);
    useEffect(() => {
        if (playerRef.current && currentStatus === VideoState.PLAYING && duration === 0) {
            playerRef.current.getDuration().then((dur: number) => {
                setDuration(dur);
                GameState.setDuration(dur);
            });
        }
    }, [duration, playerRef, currentStatus]);

    return duration;
}

function Player(
    {
        song,
        width,
        height,
        autoplay = true,
        showControls = false,
        onTimeUpdate,
        onSongEnd,
        onStatusChange,
        tracksForPlayers,
        playerChanges = [[], []],
        effectsEnabled = true,
        singSetup,
    }: Props,
    ref: ForwardedRef<PlayerRef>,
) {
    const player = useRef<VideoPlayerRef | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [currentStatus, setCurrentStatus] = useState(VideoState.UNSTARTED);

    useEffect(() => {
        GameState.setSong(song);
        GameState.setSingSetup(singSetup);
    }, [song, singSetup]);

    useEffect(() => {
        if (!player.current) {
            return;
        }
        if (currentStatus === VideoState.PLAYING) {
            const interval = setInterval(async () => {
                const time = (await player.current!.getCurrentTime()) * 1000;
                setCurrentTime(time);
                onTimeUpdate?.(time);
                GameState.setCurrentTime(time);
                GameState.update();
            }, 16.6);

            return () => clearInterval(interval);
        }
    }, [player, onTimeUpdate, currentStatus]);

    const duration = usePlayerSetDuration(player, currentStatus);

    useImperativeHandle(ref, () => ({
        seekTo: (time: number) => player.current!.seekTo(time),
        setPlaybackSpeed: (speed: number) => player.current!.setPlaybackSpeed(speed),
        play: () => player.current!.playVideo(),
    }));

    return (
        <Container>
            {currentStatus === VideoState.PAUSED && onSongEnd !== undefined && (
                <PauseMenu onExit={onSongEnd} onResume={() => player.current?.playVideo()} />
            )}
            {currentStatus !== VideoState.UNSTARTED && (
                <Overlay>
                    <GameOverlay
                        effectsEnabled={effectsEnabled}
                        playerChanges={playerChanges}
                        duration={duration}
                        currentStatus={currentStatus}
                        song={song}
                        currentTime={currentTime}
                        width={width}
                        height={height}
                        onSongEnd={onSongEnd}
                        tracksForPlayers={tracksForPlayers}
                    />
                </Overlay>
            )}
            <PlayerContainer>
                <VideoPlayer
                    ref={player}
                    video={song.video}
                    width={width}
                    height={height}
                    controls={showControls}
                    autoplay={autoplay}
                    disablekb={process.env.NODE_ENV !== 'development'}
                    startAt={(song.videoGap ?? 0) + Math.floor(singSetup.skipIntro ? song.gap / 1000 : 0)}
                    onStateChange={(state) => {
                        setCurrentStatus(state);
                        onStatusChange?.(state);
                    }}
                />
            </PlayerContainer>
        </Container>
    );
}

const Container = styled.div`
    position: relative;
`;

const Overlay = styled.div`
    position: absolute;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0.2);
    pointer-events: none;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
`;

const PlayerContainer = styled.div`
    overflow: hidden;
    height: 100%;
`;

export default forwardRef(Player);
