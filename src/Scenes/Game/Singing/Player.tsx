import { SingSetup, Song } from 'interfaces';
import { ForwardedRef, forwardRef, MutableRefObject, useEffect, useImperativeHandle, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import styled from 'styled-components';
import usePlayerVolume from '../../../hooks/usePlayerVolume';
import useUnstuckYouTubePlayer from '../../../hooks/useUnstuckYouTubePlayer';
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
    onStatusChange?: (status: number) => void;
    tracksForPlayers: [number, number];
    playerChanges?: number[][];

    effectsEnabled?: boolean;
}

export interface PlayerRef {
    seekTo: (time: number) => void;
    setPlaybackSpeed: (speed: number) => void;
}

function usePlayerSetDuration(playerRef: MutableRefObject<YouTube | null>, currentStatus: number) {
    const [duration, setDuration] = useState(0);
    useEffect(() => {
        if (playerRef.current && currentStatus === YouTube.PlayerState.PLAYING && duration === 0) {
            playerRef.current
                .getInternalPlayer()
                .getDuration()
                .then((dur: number) => {
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
    const player = useRef<YouTube | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [currentStatus, setCurrentStatus] = useState(YouTube.PlayerState.UNSTARTED);

    useEffect(() => {
        GameState.setSong(song);
        GameState.setSingSetup(singSetup);
    }, [song, singSetup]);

    useEffect(() => {
        if (!player.current) {
            return;
        }
        if (currentStatus === YouTube.PlayerState.PLAYING) {
            const interval = setInterval(async () => {
                const time = (await player.current!.getInternalPlayer().getCurrentTime()) * 1000;
                setCurrentTime(time);
                onTimeUpdate?.(time);
                GameState.setCurrentTime(time);
                GameState.update();
            }, 16.6);

            return () => clearInterval(interval);
        }
    }, [player, onTimeUpdate, currentStatus]);

    const duration = usePlayerSetDuration(player, currentStatus);
    const playerKey = useUnstuckYouTubePlayer(player, currentStatus);
    usePlayerVolume(player, song.volume);

    useEffect(() => {
        if (!player.current) {
            return;
        }

        player.current.getInternalPlayer().setSize(width, height);
    }, [player, width, height, song, playerKey]);

    useImperativeHandle(ref, () => ({
        seekTo: (time: number) => player.current!.getInternalPlayer().seekTo(time, true),
        setPlaybackSpeed: (speed: number) => player.current!.getInternalPlayer().setPlaybackRate(speed),
    }));

    return (
        <Container>
            {currentStatus === YouTube.PlayerState.PAUSED && onSongEnd !== undefined && (
                <PauseMenu onExit={onSongEnd} onResume={() => player.current?.getInternalPlayer()?.playVideo()} />
            )}
            {currentStatus !== YouTube.PlayerState.UNSTARTED && (
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
                <YouTube
                    title=" "
                    ref={player}
                    videoId={song.video}
                    key={playerKey}
                    opts={{
                        width: '0',
                        height: '0',
                        playerVars: {
                            autoplay: autoplay ? 1 : 0,
                            showinfo: 0,
                            disablekb: process.env.NODE_ENV === 'development' ? 0 : 1,
                            rel: 0,
                            fs: 0,
                            controls: showControls ? 1 : 0,
                            cc_load_policy: 3,
                            iv_load_policy: 3,
                            start: song.videoGap,
                        },
                    }}
                    onStateChange={(e) => {
                        setCurrentStatus(e.data);
                        onStatusChange?.(e.data);
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
