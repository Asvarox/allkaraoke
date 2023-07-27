import { PlayerSetup, SingSetup, Song } from 'interfaces';
import {
    ForwardedRef,
    MutableRefObject,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';

import styled from '@emotion/styled';
import VideoPlayer, { VideoPlayerRef, VideoState } from 'Elements/VideoPlayer';
import { FPSCountSetting, InputLagSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import useKeyboard from 'hooks/useKeyboard';
import useKeyboardHelp from 'hooks/useKeyboardHelp';
import usePrevious from 'hooks/usePrevious';
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
    onSongEnd: () => void;
    onStatusChange?: (status: VideoState) => void;
    players: PlayerSetup[];
    playerChanges?: number[][];

    effectsEnabled?: boolean;
    restartSong?: () => void;
}

export interface PlayerRef {
    play: () => void;
    pause: () => void;
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
        players,
        playerChanges = [[], []],
        effectsEnabled = true,
        singSetup,
        restartSong,
    }: Props,
    ref: ForwardedRef<PlayerRef>,
) {
    const player = useRef<VideoPlayerRef | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [currentStatus, setCurrentStatus] = useState(VideoState.UNSTARTED);
    const [inputLag] = useSettingValue(InputLagSetting);
    const [pauseMenu, setPauseMenu] = useState(false);

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
                if (!player.current) return;

                const time = Math.max(0, (await player.current.getCurrentTime()) * 1000 - inputLag);
                setCurrentTime(time);
                onTimeUpdate?.(time);
                GameState.setCurrentTime(time);
                GameState.update();
            }, 1000 / FPSCountSetting.get());

            return () => clearInterval(interval);
        }
    }, [player, onTimeUpdate, currentStatus, inputLag]);

    const duration = usePlayerSetDuration(player, currentStatus);

    useImperativeHandle(ref, () => ({
        seekTo: (time: number) => player.current!.seekTo(time),
        setPlaybackSpeed: (speed: number) => player.current!.setPlaybackSpeed(speed),
        play: () => player.current!.playVideo(),
        pause: () => player.current!.pauseVideo(),
    }));

    const onStateChangeCallback = useCallback(
        (state: VideoState) => {
            setCurrentStatus(state);
            onStatusChange?.(state);
        },
        [setCurrentStatus, onStatusChange],
    );

    const openPauseMenu = () => {
        setPauseMenu(true);
        player.current?.pauseVideo();
    };

    const closePauseMenu = () => {
        setPauseMenu(false);
        player.current?.playVideo();
    };

    const togglePauseMenu = () => {
        if (pauseMenu) {
            closePauseMenu();
        } else {
            openPauseMenu();
        }
    };
    const previousStatus = usePrevious(currentStatus);
    useEffect(() => {
        const wasJustPaused = previousStatus !== VideoState.PAUSED && currentStatus === VideoState.PAUSED;
        if (currentStatus === VideoState.PLAYING && pauseMenu) {
            player.current?.pauseVideo();
        } else if (wasJustPaused && !pauseMenu) {
            // Someone clicked on the video
            setPauseMenu(true);
        }
    }, [pauseMenu, currentStatus, previousStatus]);

    useKeyboard(
        {
            back: togglePauseMenu,
        },
        effectsEnabled && onSongEnd !== undefined,
        [pauseMenu],
    );

    const help = useMemo(
        () => ({
            back: 'Pause Menu',
        }),
        [],
    );
    useKeyboardHelp(help, effectsEnabled);
    return (
        <Container>
            {pauseMenu && <PauseMenu onExit={onSongEnd} onResume={closePauseMenu} onRestart={restartSong!} />}
            {currentStatus !== VideoState.UNSTARTED && (
                <Overlay>
                    <GameOverlay
                        isPauseMenuVisible={pauseMenu}
                        effectsEnabled={effectsEnabled}
                        playerChanges={playerChanges}
                        duration={duration}
                        currentStatus={currentStatus}
                        song={song}
                        width={width}
                        height={height}
                        onSongEnd={onSongEnd}
                        playerSetups={players}
                        videoPlayerRef={player.current}
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
                    volume={song.volume}
                    startAt={song.videoGap ?? 0}
                    onStateChange={onStateChangeCallback}
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
