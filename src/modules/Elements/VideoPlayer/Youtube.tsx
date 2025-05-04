import { seconds } from 'interfaces';
import { VideoState } from 'modules/Elements/VideoPlayer/VideoState';
import usePlayerVolume from 'modules/hooks/usePlayerVolume';
import useUnstuckYouTubePlayer from 'modules/hooks/useUnstuckYouTubePlayer';
import { ForwardedRef, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import { ValuesType } from 'utility-types';

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
  onStateChange?: (state: VideoState) => void;
  width: number;
  height: number;
}

export interface LoadVideByIdOpts {
  videoId: string;
  startSeconds: number;
  endSeconds: number;
}

export interface VideoPlayerRef {
  getStatus: () => ValuesType<typeof stateMap>;
  seekTo: (time: seconds) => void;
  setPlaybackSpeed: (speed: number) => void;
  setVolume: (newVolume: number) => void;
  getCurrentTime: () => Promise<seconds>;
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
  const player = useRef<YouTube | null>(null);
  const [currentStatus, setCurrentStatus] = useState(YouTube.PlayerState.UNSTARTED);

  const playerKey = useUnstuckYouTubePlayer(player, currentStatus);
  usePlayerVolume(player, volume);

  useImperativeHandle(ref, () => ({
    getStatus: () => stateMap[currentStatus],
    setSize: (w, h) => player.current?.getInternalPlayer()!.setSize(w, h),
    seekTo: (timeSec: seconds) => player.current?.getInternalPlayer()!.seekTo(timeSec, true),
    setPlaybackSpeed: (speed: number) => player.current?.getInternalPlayer()!.setPlaybackRate(speed),
    setVolume: (newVolume: number) => player.current?.getInternalPlayer()!.setVolume(newVolume),
    getCurrentTime: () => player.current?.getInternalPlayer?.()?.getCurrentTime?.() ?? Promise.resolve(0),
    loadVideoById: (opts) => player.current?.getInternalPlayer()!.loadVideoById(opts),
    playVideo: () => {
      // console.log('play');
      player.current?.getInternalPlayer()!.playVideo();
    },
    pauseVideo: () => {
      // console.log('paused');
      return player.current?.getInternalPlayer()!.pauseVideo();
    },
    getDuration: () => player.current?.getInternalPlayer?.()?.getDuration?.() ?? Promise.resolve(0),
  }));

  return (
    <YouTube
      title=" "
      key={`${video}-${playerKey}`}
      ref={player}
      videoId={video}
      opts={{
        width: width,
        height: height,
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
