import { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import styled from 'styled-components';
import { PlayerNote, Song } from '../../../interfaces';
import GameOverlay from './GameOverlay';

interface Props {
    song: Song;
    width: number;
    height: number;
    autoplay?: boolean;
    showControls?: boolean;
    onTimeUpdate?: (newTime: number) => void;
    onSongEnd?: (playerNotes: [PlayerNote[], PlayerNote[]]) => void;
    tracksForPlayers: [number, number];
    playerChanges?: number[][];

    effectsEnabled?: boolean;
}

export interface PlayerRef {
    // getCurrentTime: () => number,
    seekTo: (time: number) => void;
    setPlaybackSpeed: (speed: number) => void;
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
        tracksForPlayers,
        playerChanges = [[], []],
        effectsEnabled = true,
    }: Props,
    ref: ForwardedRef<PlayerRef>,
) {
    const player = useRef<YouTube | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentStatus, setCurrentStatus] = useState(YouTube.PlayerState.UNSTARTED);

    useEffect(() => {
        if (!player.current) {
            return;
        }
        const interval = setInterval(async () => {
            const time = (await player.current!.getInternalPlayer().getCurrentTime()) * 1000;
            setCurrentTime(time);
            onTimeUpdate?.(time);
        }, 16.6);

        return () => clearInterval(interval);
    }, [player, onTimeUpdate, currentStatus]);

    useEffect(() => {
        if (player.current && currentStatus === YouTube.PlayerState.PLAYING && duration === 0) {
            player.current.getInternalPlayer().getDuration().then(setDuration);
        }
    }, [duration, player, currentStatus]);

    useEffect(() => {
        if (!player.current) {
            return;
        }

        player.current.getInternalPlayer().setSize(width, height);
    }, [player, width, height, song]);

    useImperativeHandle(ref, () => ({
        // getCurrentTime: () => currentTime,
        seekTo: (time: number) => {
            player.current!.getInternalPlayer().seekTo(time, true);
        },
        setPlaybackSpeed: (speed: number) => player.current!.getInternalPlayer().setPlaybackRate(speed),
    }));

    return (
        <Container>
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
            <YouTube
                ref={player}
                videoId={song.video}
                opts={{
                    playerVars: {
                        autoplay: autoplay ? 1 : 0,
                        showinfo: 0,
                        rel: 0,
                        fs: 0,
                        controls: showControls ? 1 : 0,
                        // @ts-expect-error
                        cc_load_policy: 3,
                        iv_load_policy: 3,
                        start: song.videoGap,
                    },
                }}
                onStateChange={(e) => setCurrentStatus(e.data)}
            />
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

export default forwardRef(Player);
