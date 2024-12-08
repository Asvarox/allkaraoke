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

import sleep from 'modules/utils/sleep';
import Youtube, { VideoPlayerRef, VideoState } from './Youtube';

type Props = ComponentProps<typeof Youtube>;

export default forwardRef(function DirectVideoPlayer(
  { video, autoplay = true, startAt, controls, disablekb, volume, width, height, onStateChange }: Props,
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
  }, [setStatus]);

  useEffect(() => {
    onStateChange?.(status);
  }, [status, onStateChange]);

  const loadVideoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playerApi = useMemo<VideoPlayerRef>(
    () => ({
      setSize: (w, h) => setSize({ w, h }),
      seekTo: (time: number) => {
        if (player.current) {
          player.current.currentTime = time;
        }

        return time;
      },
      setPlaybackSpeed: (speed: number) => {
        if (player.current) {
          player.current.playbackRate = speed;
        }
      },
      setVolume: () => undefined,
      getCurrentTime: () => {
        return Promise.resolve(player.current?.currentTime ?? 0);
      },
      playVideo: async () => {
        await sleep(200); // simulate similar delay as with youtube videos
        return player.current?.play();
      },
      pauseVideo: () => player.current?.pause(),
      getDuration: () => Promise.resolve(player.current?.duration ?? 0),
      loadVideoById: () => {
        clearTimeout(loadVideoTimeout.current!);
        player.current?.pause();
        setStatus(VideoState.UNSTARTED);
        loadVideoTimeout.current = setTimeout(() => {
          player.current?.play();
        }, 300); // simulate similar delay as with youtube videos
      },
    }),
    [player],
  );
  useImperativeHandle(ref, () => playerApi);

  useEffect(() => {
    playerApi.setSize(width, height);
  }, [width, height, playerApi]);

  useEffect(() => {
    startAt !== undefined && playerApi.seekTo(startAt);
  }, [startAt, playerApi]);

  return (
    <video style={{ width: size.w, height: size.h }} autoPlay={autoplay} controls={controls} ref={player}>
      <source src={video} />
    </video>
  );
});
