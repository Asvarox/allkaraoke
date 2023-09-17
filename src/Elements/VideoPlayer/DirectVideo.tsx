import {
  ComponentProps,
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import Youtube, { VideoPlayerRef, VideoState } from './Youtube';

type Props = ComponentProps<typeof Youtube>;

export default forwardRef(function DirectVideoPlayer(
  { video, autoplay, startAt, controls, disablekb, volume, width, height, onStateChange }: Props,
  ref: ForwardedRef<VideoPlayerRef>,
) {
  const player = useRef<HTMLVideoElement | null>(null);
  const [size, setSize] = useState({ w: width, h: height });
  const [status, setStatus] = useState(VideoState.UNSTARTED);

  useEffect(() => {
    const createCallback = (status: VideoState) => () => setStatus(status);
    const playerRef = player.current;

    const onPlay = createCallback(VideoState.PLAYING);
    const onPause = createCallback(VideoState.PAUSED);
    const onEnded = createCallback(VideoState.ENDED);
    // const onLoadstart = createCallback(VideoState.BUFFERING);

    playerRef?.addEventListener('playing', onPlay);
    playerRef?.addEventListener('pause', onPause);
    playerRef?.addEventListener('ended', onEnded);
    // playerRef?.addEventListener('loadstart', onLoadstart);

    return () => {
      playerRef?.removeEventListener('playing', onPlay);
      playerRef?.removeEventListener('pause', onPause);
      playerRef?.removeEventListener('ended', onEnded);
      // playerRef?.removeEventListener('loadstart', onLoadstart);
    };
  }, [player.current, setStatus]);

  useEffect(() => {
    onStateChange?.(status);
  }, [status, onStateChange]);

  const playerApi = useMemo<VideoPlayerRef>(
    () => ({
      setSize: (w, h) => setSize({ w, h }),
      seekTo: (time: number) => {
        player.current && (player.current.currentTime = time);

        return time;
      },
      setPlaybackSpeed: () => undefined,
      setVolume: () => undefined,
      getCurrentTime: () => {
        return Promise.resolve(player.current?.currentTime ?? 0);
      },
      loadVideoById: () => undefined,
      playVideo: () => player.current?.play(),
      pauseVideo: () => player.current?.pause(),
      getDuration: () => Promise.resolve(player.current?.duration ?? 0),
    }),
    [player],
  );

  useEffect(() => {
    playerApi.setSize(width, height);
  }, [width, height, playerApi]);

  useEffect(() => {
    startAt !== undefined && playerApi.seekTo(startAt);
  }, [startAt, playerApi]);

  useImperativeHandle(ref, () => playerApi);

  return (
    <video width={size.w} height={size.h} autoPlay={autoplay ?? true} controls={controls} ref={player}>
      <source src={video} />
    </video>
  );
});
