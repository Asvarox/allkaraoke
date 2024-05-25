import { PlayerSetup, seconds, SingSetup, Song } from 'interfaces';
import {
  ComponentProps,
  ForwardedRef,
  forwardRef,
  MutableRefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import styled from '@emotion/styled';
import VideoPlayer, { VideoPlayerRef, VideoState } from 'modules/Elements/VideoPlayer';
import useKeyboard from 'modules/hooks/useKeyboard';
import useKeyboardHelp from 'modules/hooks/useKeyboardHelp';
import usePrevious from 'modules/hooks/usePrevious';
import { FPSCountSetting, InputLagSetting, useSettingValue } from 'routes/Settings/SettingsState';
import GameState from '../../../modules/GameEngine/GameState/GameState';
import PauseMenu from './GameOverlay/Components/PauseMenu';
import GameOverlay from './GameOverlay/GameOverlay';

interface Props extends ComponentProps<typeof Container> {
  singSetup: SingSetup;
  song: Song;
  width: number;
  height: number;
  autoplay?: boolean;
  showControls?: boolean;
  onCurrentTimeUpdate?: (newTime: number) => void;
  onSongEnd: () => void;
  onStatusChange?: (status: VideoState) => void;
  players: PlayerSetup[];

  effectsEnabled?: boolean;
  pauseMenu?: boolean;
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
    onCurrentTimeUpdate,
    onSongEnd,
    onStatusChange,
    players,
    effectsEnabled = true,
    singSetup,
    restartSong,
    pauseMenu = false,
    ...restProps
  }: Props,
  ref: ForwardedRef<PlayerRef>,
) {
  const player = useRef<VideoPlayerRef | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(VideoState.UNSTARTED);
  const [inputLag] = useSettingValue(InputLagSetting);
  const [pauseMenuVisible, setPauseMenuVisible] = useState(false);

  useEffect(() => {
    GameState.setSong(song);
    GameState.setSingSetup(singSetup);

    return () => {
      GameState.resetSingSetup();
    };
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
        onCurrentTimeUpdate?.(time);
        GameState.setCurrentTime(time);
        GameState.update();
      }, 1000 / FPSCountSetting.get());

      return () => clearInterval(interval);
    }
  }, [player, onCurrentTimeUpdate, currentStatus, inputLag]);

  const duration = usePlayerSetDuration(player, currentStatus);

  useImperativeHandle(ref, () => ({
    seekTo: (time: seconds) => player.current!.seekTo(time),
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

  const isPauseMenuAvailable = pauseMenu;

  const openPauseMenu = () => {
    setPauseMenuVisible(true);
    player.current?.pauseVideo();
  };

  const closePauseMenu = () => {
    setPauseMenuVisible(false);
    player.current?.playVideo();
  };

  const togglePauseMenu = () => {
    if (pauseMenuVisible) {
      closePauseMenu();
    } else {
      openPauseMenu();
    }
  };
  const previousStatus = usePrevious(currentStatus);
  useEffect(() => {
    if (!isPauseMenuAvailable) return;

    const wasJustPaused =
      previousStatus !== VideoState.PAUSED &&
      previousStatus !== VideoState.BUFFERING &&
      currentStatus === VideoState.PAUSED;

    if (currentStatus === VideoState.PLAYING && pauseMenuVisible) {
      player.current?.pauseVideo();
    } else if (wasJustPaused && !pauseMenuVisible) {
      // Someone clicked on the video
      setPauseMenuVisible(true);
    }
  }, [pauseMenuVisible, currentStatus, previousStatus, isPauseMenuAvailable]);

  useKeyboard(
    {
      back: togglePauseMenu,
    },
    isPauseMenuAvailable,
    [pauseMenuVisible],
  );

  const help = useMemo(
    () => ({
      back: 'Pause Menu',
    }),
    [],
  );
  useKeyboardHelp(help, effectsEnabled);
  return (
    <Container {...restProps}>
      {pauseMenuVisible && <PauseMenu onExit={onSongEnd} onResume={closePauseMenu} onRestart={restartSong!} />}
      {currentStatus !== VideoState.UNSTARTED && (
        <Overlay
          style={{
            width: `${width}px`,
            height: `${height}px`,
          }}>
          <GameOverlay
            isPauseMenuVisible={pauseMenuVisible}
            effectsEnabled={effectsEnabled}
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
        {currentStatus === VideoState.PLAYING && (
          <GoFastButton
            data-test="make-song-go-fast"
            onClick={() => {
              player.current?.setPlaybackSpeed(2);
            }}
          />
        )}
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

const GoFastButton = styled.div`
  width: 30px;
  height: 30px;
  opacity: 0.01;
  background: black;
  position: absolute;
  bottom: calc(100vh / 2 - 15px);
  left: 0;
`;

export default forwardRef(Player);
