import {
  ComponentProps,
  RefAttributes,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { milliseconds, seconds, SingSetup, Song } from '~/interfaces';
import VideoPlayer, { VideoPlayerRef, VideoState } from '~/modules/elements/video-player/index';
import useKeyboard from '~/modules/hooks/use-keyboard';
import useKeyboardHelp from '~/modules/hooks/use-keyboard-help';
import usePrevious from '~/modules/hooks/use-previous';
import { FeatureFlags } from '~/modules/utils/feature-flags';
import useFeatureFlag from '~/modules/utils/use-feature-flag';
import { useVideoPlayer } from '~/routes/game/singing/hooks/use-video-player';
import { cn } from '~/utils/cn';

import GameState from '../../../modules/game-engine/game-state/game-state';
import PauseMenu from './game-overlay/components/pause-menu';
import GameOverlay from './game-overlay/game-overlay';

interface Props extends Omit<ComponentProps<'div'>, 'ref'>, RefAttributes<PlayerRef> {
  singSetup: SingSetup;
  song: Song;
  width: number;
  height: number;
  autoplay?: boolean;
  showControls?: boolean;
  onCurrentTimeUpdate?: (newTime: milliseconds) => void;
  onSongEnd?: () => void;
  onStatusChange?: (status: VideoState) => void;

  effectsEnabled?: boolean;
  pauseMenu?: boolean;
  restartSong?: () => void;
  gameVolume?: number;
}

export interface PlayerRef {
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  getCurrentTime: () => Promise<milliseconds>;
  getDuration?: () => seconds;
}

function usePlayerSetDuration(playerRef: RefObject<VideoPlayerRef | null>, currentStatus: VideoState) {
  const [duration, setDuration] = useState<seconds>(0);
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

function Player({
  song,
  width,
  height,
  autoplay = true,
  showControls = false,
  onCurrentTimeUpdate,
  onSongEnd,
  onStatusChange,
  effectsEnabled = true,
  singSetup,
  restartSong,
  gameVolume = 1,
  pauseMenu = false,
  ref,
  ...restProps
}: Props) {
  'use no memo'; // React Compiler: none of GameOverlay's props tick every frame (score comes from GameState, read at render time), so the compiler memoizes the <GameOverlay> element across renders and the score display never updates.
  const newVolumeFFEnabled = useFeatureFlag(FeatureFlags.NewVolume);
  const player = useRef<VideoPlayerRef | null>(null);
  const [pauseMenuVisible, setPauseMenuVisible] = useState(false);

  const { className, ...containerProps } = restProps;

  const updateGameState = useCallback(
    (time: milliseconds) => {
      onCurrentTimeUpdate?.(time);
      GameState.setCurrentTime(time);
      GameState.update();
    },
    [onCurrentTimeUpdate],
  );

  const [currentStatus, setCurrentStatus] = useVideoPlayer(player, updateGameState);

  useEffect(() => {
    GameState.setSong(song);
    GameState.setSingSetup(singSetup);

    return () => {
      GameState.resetSingSetup();
    };
  }, [song, singSetup]);

  const duration = usePlayerSetDuration(player, currentStatus);

  useImperativeHandle(ref, () => ({
    seekTo: (time: seconds) => player.current!.seekTo(time),
    setPlaybackSpeed: (speed: number) => player.current!.setPlaybackSpeed(speed),
    play: () => player.current!.playVideo(),
    pause: () => player.current!.pauseVideo(),
    getCurrentTime: async () => ((await player.current?.getCurrentTime()) ?? 0) * 1000,
    getDuration: () => duration,
  }));

  const onStateChangeCallback = useCallback(
    (state: VideoState) => {
      setCurrentStatus(state);
      onStatusChange?.(state);
    },
    [setCurrentStatus, onStatusChange],
  );

  const isPauseMenuAvailable = pauseMenu;
  const songVolume = newVolumeFFEnabled ? (song.volume ?? song.manualVolume) : song.manualVolume;
  const effectiveVolume = (songVolume ?? 0.5) * gameVolume;

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
    <div className={cn('relative', className)} {...containerProps}>
      <PauseMenu onExit={onSongEnd} onResume={closePauseMenu} onRestart={restartSong!} open={pauseMenuVisible} />
      {currentStatus !== VideoState.UNSTARTED && (
        <div
          className="pointer-events-none absolute inset-0 z-10 bg-black/20"
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
            playerSetups={singSetup.players}
            videoPlayerRef={player}
          />
        </div>
      )}
      <div className="h-full overflow-hidden">
        <VideoPlayer
          ref={player}
          video={song.video}
          width={width}
          height={height}
          controls={showControls}
          autoplay={autoplay}
          disablekb={process.env.NODE_ENV !== 'development'}
          volume={effectiveVolume}
          startAt={song.videoGap ?? 0}
          onStateChange={onStateChangeCallback}
        />
        {currentStatus === VideoState.PLAYING && (
          <div
            className="absolute top-1/2 left-0 h-8 w-8 -translate-y-1/2 bg-black opacity-0"
            data-test="make-song-go-fast"
            onClick={() => {
              player.current?.setPlaybackSpeed(2);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Player;
