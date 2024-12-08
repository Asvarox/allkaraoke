import { seconds } from 'interfaces';
import usePlayerVolume from 'modules/hooks/usePlayerVolume';
import useUnstuckYouTubePlayer from 'modules/hooks/useUnstuckYouTubePlayer';
import { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import YouTube from 'react-youtube';

export enum VideoState {
  UNSTARTED = 'UNSTARTED',
  ENDED = 'ENDED',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  BUFFERING = 'BUFFERING',
  CUED = 'CUED',
}

const stateMap = {
  [YouTube.PlayerState.UNSTARTED]: VideoState.UNSTARTED,
  [YouTube.PlayerState.ENDED]: VideoState.ENDED,
  [YouTube.PlayerState.PLAYING]: VideoState.PLAYING,
  [YouTube.PlayerState.PAUSED]: VideoState.PAUSED,
  [YouTube.PlayerState.BUFFERING]: VideoState.BUFFERING,
  [YouTube.PlayerState.CUED]: VideoState.CUED,
} as const;

interface Props {
  video: string;
  autoplay?: boolean;
  controls?: boolean;
  disablekb?: boolean;
  volume?: number;
  startAt?: number;
  onStateChange: (state: VideoState) => void;
  width: number;
  height: number;
}

export interface LoadVideByIdOpts {
  videoId: string;
  startSeconds: number;
  endSeconds: number;
}

export interface VideoPlayerRef {
  seekTo: (time: seconds) => void;
  setPlaybackSpeed: (speed: number) => void;
  setVolume: (newVolume: number) => void;
  getCurrentTime: () => Promise<number>;
  loadVideoById: (opts: LoadVideByIdOpts) => void;
  setSize: (w: number, h: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getDuration: () => Promise<number>;
}

export default forwardRef(function YoutubeVideoPlayer(
  { video, autoplay, startAt, controls, disablekb, volume, width, height, onStateChange }: Props,
  ref: ForwardedRef<VideoPlayerRef>,
) {
  const [player, setPlayer] = useState<YouTube | null>(null);
  const [currentStatus, setCurrentStatus] = useState(YouTube.PlayerState.UNSTARTED);

  const playerKey = useUnstuckYouTubePlayer(player, currentStatus);
  usePlayerVolume(player, volume);
  useEffect(() => {
    if (!player) {
      return;
    }

    player.getInternalPlayer()!.setSize(width, height);
  }, [player, width, height, video, playerKey]);

  const api = useMemo(
    (): VideoPlayerRef => ({
      setSize: (w, h) => player?.getInternalPlayer()!.setSize(w, h),
      seekTo: (timeSec: seconds) => player?.getInternalPlayer()!.seekTo(timeSec, true),
      setPlaybackSpeed: (speed: number) => player?.getInternalPlayer()!.setPlaybackRate(speed),
      setVolume: (newVolume: number) => player?.getInternalPlayer()!.setVolume(newVolume),
      getCurrentTime: () => player?.getInternalPlayer?.()?.getCurrentTime?.() ?? Promise.resolve(0),
      loadVideoById: (opts) => player?.getInternalPlayer()!.loadVideoById(opts),
      playVideo: () => {
        // console.log('play');
        player?.getInternalPlayer()!.playVideo();
      },
      pauseVideo: () => {
        // console.log('paused');
        return player?.getInternalPlayer()!.pauseVideo();
      },
      getDuration: () => player?.getInternalPlayer?.()?.getDuration?.() ?? Promise.resolve(0),
    }),
    [player],
  );

  useImperativeHandle(ref, () => api);

  return (
    <YouTube
      title=" "
      key={`${video}-${playerKey}`}
      ref={setPlayer}
      videoId={video}
      opts={{
        width: '0',
        height: '0',
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          rel: 0,
          fs: 0,
          controls: controls ? 1 : 0,
          start: startAt ?? 0,
          end: 0,
          disablekb: disablekb ? 1 : 0,
          modestbranding: 1,
        },
      }}
      onStateChange={(e) => {
        setCurrentStatus(e.data);
        onStateChange?.(stateMap[e.data]);
      }}
    />
  );
});
