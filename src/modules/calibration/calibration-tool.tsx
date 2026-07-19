import { useEffect, useRef, useState } from 'react';
import { useMeasure } from 'react-use';
import { twMerge } from 'tailwind-merge';

import Typography from '~/modules/elements/akui/primitives/typography';
import VideoPlayer, { VideoPlayerRef, VideoState } from '~/modules/elements/video-player/index';
import isE2E from '~/modules/utils/is-e2-e';
import { useVideoPlayer } from '~/routes/game/singing/hooks/use-video-player';

export const CalibrationTool = () => {
  // The circle shrinks from full size to nothing every 250ms of video time, so a screenshot can catch it
  // at any size (or mid-remount). In E2E it's pinned to its full-size first frame instead.
  const frozen = isE2E();
  const [playerContainer, { width }] = useMeasure<HTMLDivElement>();
  const playerRef = useRef<VideoPlayerRef>(null);
  const [currentStatus, setCurrentStatus, currentTime] = useVideoPlayer(playerRef);
  const [nextPulse, setNextPulse] = useState(250);

  useEffect(() => {
    if (nextPulse < currentTime) {
      setNextPulse(nextPulse + 250);
    }
  }, [nextPulse, currentTime]);

  useEffect(() => {
    if (currentStatus === VideoState.PLAYING) {
      playerRef.current?.setPlaybackSpeed(0.25);
    }
  }, [currentStatus]);

  return (
    <div className="flex flex-col items-center justify-center" ref={playerContainer}>
      {currentStatus === VideoState.PLAYING ? (
        <div
          className={twMerge(
            'bg-active pointer-events-none absolute h-[150px] w-[150px] rounded-full',
            !frozen && 'animate-calibrate-pulse',
          )}
          key={frozen ? 'frozen' : nextPulse}
        />
      ) : (
        <Typography className="pointer-events-none absolute text-center">
          <strong>Click here</strong> to start calibration
        </Typography>
      )}
      <div className="opacity-0">
        <VideoPlayer
          autoplay
          ref={playerRef}
          video="ivNFSVAYVZU"
          width={width}
          height={150}
          onStateChange={setCurrentStatus}
        />
      </div>
    </div>
  );
};
