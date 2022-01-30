import { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import styled from 'styled-components';
import { PlayerNote, SingSetup, Song } from '../../../interfaces';
import PauseMenu from './Components/PauseMenu';
import GameOverlay from './GameOverlay';
import GameState from './GameState/GameState';

interface Props {
    singSetup: SingSetup;
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
        singSetup,
    }: Props,
    ref: ForwardedRef<PlayerRef>,
) {
    const player = useRef<YouTube | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
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

    useEffect(() => {
        if (player.current && currentStatus === YouTube.PlayerState.PLAYING && duration === 0) {
            player.current
                .getInternalPlayer()
                .getDuration()
                .then((dur: number) => {
                    setDuration(dur);
                    GameState.setDuration(dur);
                });
            player.current.getInternalPlayer().setVolume(Math.round((song.volume ?? 0.5) * 100));
        }
    }, [duration, player, currentStatus, song.volume]);

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
        <Container width={width} height={height} video={song.video}>
            {currentStatus === YouTube.PlayerState.PAUSED && onSongEnd !== undefined && (
                <PauseMenu
                    onExit={() => onSongEnd([[], []])}
                    onResume={() => player.current?.getInternalPlayer()?.playVideo()}
                />
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
            <YouTube
                ref={player}
                videoId={song.video}
                opts={{
                    width: '0',
                    height: '0',
                    playerVars: {
                        autoplay: autoplay ? 1 : 0,
                        showinfo: 0,
                        disablekb: 0,
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

const Container = styled.div.attrs<{ video: string; width: number; height: number }>((props) => ({
    style: {
        backgroundImage: `url('https://i3.ytimg.com/vi/${props.video}/hqdefault.jpg')`,
        width: `${props.width}px`,
        height: `${props.height}px`,
    },
}))<{ video: string; width: number; height: number }>`
    background-size: cover;
    background-position: center center;
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
